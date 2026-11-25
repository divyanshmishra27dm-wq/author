import os
import shutil
import tempfile
import base64
import json
import re
import time
import urllib.parse
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, PlainTextResponse
from converter import convert_pptx_to_b2b, generate_standalone_html, build_scorm2004_zip

app = FastAPI(title="B2B PPTX to Rich Mobile SCORM Converter")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PUBLIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public")
os.makedirs(PUBLIC_DIR, exist_ok=True)
MEDIA_DIR = os.path.join(PUBLIC_DIR, "media")
os.makedirs(MEDIA_DIR, exist_ok=True)

# Mount media directory so FastAPI can also serve media files directly
app.mount("/media", StaticFiles(directory=MEDIA_DIR), name="media")

@app.get("/api/health")
def health():
    return {"status": "ok", "engine": "B2B Rich Mobile Micro-Learning & SCORM 2004 Engine"}

@app.get("/api/course")
def get_course(name: str = "Sample PPT for VO 1"):
    """
    Retrieves the exact parsed course chapters & title for the visual editor.
    """
    raw_name = os.path.basename(name).split('?')[0]
    raw_name = re.sub(r'\.html$', '', raw_name, flags=re.IGNORECASE)
    clean_name = re.sub(r'[^a-zA-Z0-9_\- ]', '_', raw_name).strip()

    html_path = os.path.join(PUBLIC_DIR, f"{clean_name}.html")
    if not os.path.exists(html_path):
        norm_req = re.sub(r'[\s_]+', '_', clean_name).lower()
        matched = False
        # 1. Match filename directly or normalized
        for f in os.listdir(PUBLIC_DIR):
            if f.endswith('.html') and not f.startswith('index'):
                f_base = os.path.splitext(f)[0]
                if re.sub(r'[\s_]+', '_', f_base).lower() == norm_req:
                    html_path = os.path.join(PUBLIC_DIR, f)
                    clean_name = f_base
                    matched = True
                    break

        # 2. Match <title> inside HTML files in PUBLIC_DIR
        if not matched and clean_name:
            for f in os.listdir(PUBLIC_DIR):
                if f.endswith('.html') and not f.startswith('index'):
                    cand_path = os.path.join(PUBLIC_DIR, f)
                    try:
                        with open(cand_path, 'r', encoding='utf-8', errors='ignore') as cf:
                            head_part = cf.read(4096)
                            m_t = re.search(r'<title>(.*?)</title>', head_part, re.IGNORECASE)
                            if m_t:
                                cand_title = m_t.group(1).strip()
                                norm_cand = re.sub(r'[\s_]+', '_', cand_title).lower()
                                if norm_req == norm_cand or (len(norm_req) > 3 and norm_req in norm_cand) or (len(norm_cand) > 3 and norm_cand in norm_req):
                                    html_path = cand_path
                                    clean_name = os.path.splitext(f)[0]
                                    matched = True
                                    break
                    except Exception:
                        pass

        # 3. Fallback: pick the most recently modified non-index HTML file
        if not matched:
            candidates = [f for f in os.listdir(PUBLIC_DIR) if f.endswith(".html") and not f.startswith("index")]
            if candidates:
                candidates.sort(key=lambda x: os.path.getmtime(os.path.join(PUBLIC_DIR, x)), reverse=True)
                html_path = os.path.join(PUBLIC_DIR, candidates[0])
                clean_name = os.path.splitext(candidates[0])[0]
            else:
                return {"error": "No course found", "chapters": []}

    try:
        with open(html_path, "r", encoding="utf-8") as f:
            content = f.read()

        m_title = re.search(r'<title>(.*?)</title>', content)
        title = m_title.group(1) if m_title else clean_name
        m_chapters = re.search(r'var COURSE_CHAPTERS = (\[.*?\]);\s*window\.COURSE_CHAPTERS', content, re.DOTALL)
        chapters = json.loads(m_chapters.group(1)) if m_chapters else []

        encoded_name = urllib.parse.quote(clean_name)
        return {
            "success": True,
            "title": title,
            "name": clean_name,
            "chapters": chapters,
            "preview_url": f"/{encoded_name}.html"
        }
    except Exception as e:
        return {"error": str(e), "chapters": []}

@app.post("/api/course/update")
async def update_course_endpoint(payload: dict):
    """
    Receives updated course chapters, recompiles standalone HTML and SCORM 2004 ZIP,
    and returns refreshed URLs so the preview and exports immediately sync.
    """
    course_name = payload.get("course_name", "Sample PPT for VO 1")
    raw_name = os.path.basename(course_name).split('?')[0]
    raw_name = re.sub(r'\.html$', '', raw_name, flags=re.IGNORECASE)
    clean_name = re.sub(r'[^a-zA-Z0-9_\- ]', '_', raw_name).strip()
    if not clean_name:
        clean_name = "Sample_Course"

    # Match exact filename in PUBLIC_DIR if exists (handling underscore variances)
    norm_req = re.sub(r'[\s_]+', '_', clean_name).lower()
    for f in os.listdir(PUBLIC_DIR):
        if f.endswith('.html') and not f.startswith('index'):
            f_base = os.path.splitext(f)[0]
            if re.sub(r'[\s_]+', '_', f_base).lower() == norm_req:
                clean_name = f_base
                break

    course_data = payload.get("course_data", {})

    if not course_data or "chapters" not in course_data:
        return {"error": "Invalid course data. Must include chapters."}

    if "title" not in course_data:
        course_data["title"] = clean_name

    # 1. Rebuild Standalone HTML
    html_content = generate_standalone_html(course_data)
    pub_html_path = os.path.join(PUBLIC_DIR, f"{clean_name}.html")
    with open(pub_html_path, "w", encoding="utf-8") as f:
        f.write(html_content)

    if os.path.exists(DIST_DIR):
        dist_html_path = os.path.join(DIST_DIR, f"{clean_name}.html")
        try:
            with open(dist_html_path, "w", encoding="utf-8") as f:
                f.write(html_content)
        except Exception:
            pass

    # 2. Rebuild SCORM 2004 ZIP
    pub_zip_path = os.path.join(PUBLIC_DIR, f"{clean_name}_SCORM2004.zip")
    media_dir = os.path.join(PUBLIC_DIR, "media")
    build_scorm2004_zip(course_data, pub_zip_path, media_dir=media_dir)

    ts = int(time.time() * 1000)
    encoded_name = urllib.parse.quote(clean_name)
    preview_url = f"/{encoded_name}.html?t={ts}"

    return {
        "success": True,
        "preview_url": preview_url,
        "html_url": f"/{encoded_name}.html",
        "scorm_zip_url": f"/{encoded_name}_SCORM2004.zip",
        "total_chapters": len(course_data["chapters"]),
        "title": course_data["title"]
    }

@app.post("/api/upload_audio")
async def upload_audio_endpoint(file: UploadFile = File(...)):
    """
    Uploads an audio voiceover file (.mp3, .wav, .m4a, .ogg, .webm, .aac) to public/media/
    so it can be embedded into cards and packaged into SCORM 2004 ZIP and standalone HTML.
    """
    media_dir = os.path.join(PUBLIC_DIR, "media")
    os.makedirs(media_dir, exist_ok=True)

    orig_name = file.filename or f"audio_{int(time.time())}.mp3"
    name, ext = os.path.splitext(orig_name)
    clean_base = re.sub(r'[^a-zA-Z0-9_\- ]', '_', name).strip()
    if not clean_base:
        clean_base = f"audio_{int(time.time())}"
    clean_filename = f"{clean_base}{ext.lower()}"

    target_path = os.path.join(media_dir, clean_filename)
    counter = 1
    while os.path.exists(target_path):
        clean_filename = f"{clean_base}_{counter}{ext.lower()}"
        target_path = os.path.join(media_dir, clean_filename)
        counter += 1

    content = await file.read()
    with open(target_path, "wb") as f:
        f.write(content)

    return {
        "success": True,
        "audio_url": f"media/{clean_filename}",
        "filename": clean_filename,
        "size": len(content)
    }

@app.post("/api/convert")
async def convert_pptx_endpoint(file: UploadFile = File(...)):
    # Save uploaded PPTX to temporary file
    temp_dir = tempfile.mkdtemp(prefix="b2b_conv_")
    try:
        temp_pptx_path = os.path.join(temp_dir, file.filename)
        with open(temp_pptx_path, "wb") as f:
            content = await file.read()
            f.write(content)

        # Run conversion to rich mobile micro-learning & SCORM 2004
        result = convert_pptx_to_b2b(temp_pptx_path, output_dir=temp_dir)

        base_name = os.path.splitext(file.filename)[0]
        clean_base = re.sub(r'[^a-zA-Z0-9_\- ]', '_', base_name).strip() or "Uploaded_Course"

        # Copy generated files to public directory for instant download and preview
        pub_html_path = os.path.join(PUBLIC_DIR, f"{base_name}.html")
        pub_zip_path = os.path.join(PUBLIC_DIR, f"{base_name}_SCORM2004.zip")
        shutil.copy2(result["html_path"], pub_html_path)
        shutil.copy2(result["scorm_zip_path"], pub_zip_path)

        # Also copy to DIST_DIR so Nginx in container can serve immediately
        if os.path.exists(DIST_DIR):
            try:
                shutil.copy2(result["html_path"], os.path.join(DIST_DIR, f"{base_name}.html"))
                shutil.copy2(result["scorm_zip_path"], os.path.join(DIST_DIR, f"{base_name}_SCORM2004.zip"))
            except Exception as dist_err:
                print(f"Warning copying to DIST_DIR: {dist_err}")

        # If clean_base differs from base_name, copy both so URLs match under both schemes
        if clean_base != base_name:
            try:
                shutil.copy2(result["html_path"], os.path.join(PUBLIC_DIR, f"{clean_base}.html"))
                shutil.copy2(result["scorm_zip_path"], os.path.join(PUBLIC_DIR, f"{clean_base}_SCORM2004.zip"))
                if os.path.exists(DIST_DIR):
                    shutil.copy2(result["html_path"], os.path.join(DIST_DIR, f"{clean_base}.html"))
                    shutil.copy2(result["scorm_zip_path"], os.path.join(DIST_DIR, f"{clean_base}_SCORM2004.zip"))
            except Exception:
                pass

        # Read standalone HTML content
        with open(result["html_path"], "r", encoding="utf-8") as f:
            html_content = f.read()

        # Read SCORM 2004 ZIP as base64
        with open(result["scorm_zip_path"], "rb") as f:
            scorm_zip_base64 = base64.b64encode(f.read()).decode("utf-8")

        # Preview URL is the exact converted HTML for this uploaded presentation
        encoded_name = urllib.parse.quote(base_name)
        preview_url = f"/{encoded_name}.html"

        return {
            "success": True,
            "title": result["title"],
            "course_name": base_name,
            "filename": f"{base_name}.html",
            "total_chapters": result["total_chapters"],
            "preview_url": preview_url,
            "html_url": preview_url,
            "scorm_zip_url": f"/{encoded_name}_SCORM2004.zip",
            "html_content": html_content,
            "scorm_zip_base64": scorm_zip_base64,
            "course_data": result.get("course_data", {})
        }
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)

DIST_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "dist")
if os.path.exists(DIST_DIR) and os.path.exists(os.path.join(DIST_DIR, "assets")):
    app.mount("/assets", StaticFiles(directory=os.path.join(DIST_DIR, "assets")), name="assets")

@app.get("/{full_path:path}")
async def serve_static_or_spa(full_path: str):
    unquoted = urllib.parse.unquote(full_path).lstrip("/")
    if unquoted:
        pub_file = os.path.join(PUBLIC_DIR, unquoted)
        if os.path.isfile(pub_file):
            return FileResponse(pub_file)

        if os.path.exists(DIST_DIR):
            dist_file = os.path.join(DIST_DIR, unquoted)
            if os.path.isfile(dist_file):
                return FileResponse(dist_file)

        # Match case-insensitively or with normalized underscores
        norm = re.sub(r'[\s_]+', '_', unquoted).lower()
        for d in [PUBLIC_DIR, DIST_DIR]:
            if os.path.exists(d):
                for f in os.listdir(d):
                    if re.sub(r'[\s_]+', '_', f).lower() == norm:
                        return FileResponse(os.path.join(d, f))

    if os.path.exists(DIST_DIR):
        index_file = os.path.join(DIST_DIR, "index.html")
        if os.path.isfile(index_file):
            return FileResponse(index_file)

    return PlainTextResponse("Page Not Found", status_code=404)

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    print(f"Starting server on port {port}...")
    uvicorn.run(app, host="0.0.0.0", port=port)
