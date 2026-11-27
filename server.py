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
from fastapi.responses import FileResponse, PlainTextResponse, Response
from converter import convert_pptx_to_b2b, generate_standalone_html, build_scorm2004_zip, ingest_scorm_zip

app = FastAPI(title="B2B PPTX to Rich Mobile SCORM Converter")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

AUTH_PASSWORD = os.getenv("AUTH_PASSWORD", "($1advT%")

@app.middleware("http")
async def verify_auth_middleware(request, call_next):
    # Allow health check, OPTIONS preflight, static files, and media
    path = request.url.path
    if path == "/api/health" or request.method == "OPTIONS":
        return await call_next(request)

    # Protect all /api/ endpoints
    if path.startswith("/api/"):
        provided_key = request.headers.get("X-Access-Key") or request.query_params.get("access_key")
        if AUTH_PASSWORD and provided_key != AUTH_PASSWORD:
            from fastapi.responses import JSONResponse
            return JSONResponse(status_code=401, content={"error": "Unauthorized. Invalid access password."})

    return await call_next(request)

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
PUBLIC_DIR = os.path.join(ROOT_DIR, "public")
os.makedirs(PUBLIC_DIR, exist_ok=True)
MEDIA_DIR = os.path.join(PUBLIC_DIR, "media")
os.makedirs(MEDIA_DIR, exist_ok=True)
ROOT_MEDIA = os.path.join(ROOT_DIR, "media")
DIST_DIR = os.path.join(ROOT_DIR, "dist")

# Robust media serving endpoint that cleanly decodes percent-encoded URLs (%20, etc.),
# handles case-insensitivity, matches spaces and underscores, and searches public/media,
# root media, dist/media, public/slides, and dist/slides.
MEDIA_EXTS = ('.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.mp3', '.mp4', '.wav', '.ogg', '.m4a', '.webm', '.mov', '.m4v')
MEDIA_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=86400",
}

@app.api_route("/media/{media_path:path}", methods=["GET", "HEAD"])
async def serve_media_file(media_path: str):
    raw = urllib.parse.unquote_plus(media_path).lstrip("/")
    clean_target = re.sub(r'^(media|slides)/+', '', raw)
    
    search_dirs = [
        MEDIA_DIR,
        ROOT_MEDIA,
        os.path.join(PUBLIC_DIR, "slides"),
        os.path.join(DIST_DIR, "media") if os.path.exists(DIST_DIR) else None,
        os.path.join(DIST_DIR, "slides") if os.path.exists(DIST_DIR) else None,
        PUBLIC_DIR,
        DIST_DIR if os.path.exists(DIST_DIR) else None,
    ]
    search_dirs = [d for d in search_dirs if d and os.path.exists(d)]

    # 1. Exact unquoted match across media and slides
    for target in [clean_target, raw]:
        for d in search_dirs:
            p = os.path.join(d, target)
            if os.path.isfile(p):
                return FileResponse(p, headers=MEDIA_HEADERS)

    # 2. Normalized matching (matches space vs underscore differences and case-insensitivity)
    norm = re.sub(r'[\s_\-]+', '_', clean_target).lower()
    for d in search_dirs:
        try:
            for f in os.listdir(d):
                if re.sub(r'[\s_\-]+', '_', f).lower() == norm:
                    return FileResponse(os.path.join(d, f), headers=MEDIA_HEADERS)
        except Exception:
            pass

    return PlainTextResponse("Media Not Found", status_code=404)

@app.api_route("/slides/{slide_path:path}", methods=["GET", "HEAD"])
async def serve_slide_file(slide_path: str):
    return await serve_media_file(slide_path)

@app.api_route("/scorm_player/media/{media_path:path}", methods=["GET", "HEAD"])
async def serve_scorm_player_media(media_path: str):
    return await serve_media_file(media_path)

@app.api_route("/scorm_player/slides/{slide_path:path}", methods=["GET", "HEAD"])
async def serve_scorm_player_slides(slide_path: str):
    return await serve_media_file(slide_path)

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

@app.get("/api/courses")
def list_courses():
    """
    Dynamically lists all available converted courses from PUBLIC_DIR.
    Extracts real title, chapter count, preview URL, and SCORM zip URL without hardcoding.
    """
    courses = []
    if not os.path.exists(PUBLIC_DIR):
        return {"success": True, "courses": []}

    for f in os.listdir(PUBLIC_DIR):
        if f.endswith('.html') and not f.startswith('index'):
            f_path = os.path.join(PUBLIC_DIR, f)
            try:
                base = os.path.splitext(f)[0]
                mtime = os.path.getmtime(f_path)
                with open(f_path, 'r', encoding='utf-8', errors='ignore') as hf:
                    full_content = hf.read()
                    m_t = re.search(r'<title>(.*?)</title>', full_content, re.IGNORECASE)
                    title = m_t.group(1).strip() if m_t else base
                    m_chap = re.search(r'var COURSE_CHAPTERS = (\[.*?\]);\s*window\.COURSE_CHAPTERS', full_content, re.DOTALL)
                    total_chapters = len(json.loads(m_chap.group(1))) if m_chap else 0

                encoded_name = urllib.parse.quote(base)
                courses.append({
                    "name": base,
                    "title": title,
                    "total_chapters": total_chapters,
                    "preview_url": f"/{encoded_name}.html",
                    "scorm_zip_url": f"/{encoded_name}_SCORM2004.zip",
                    "mtime": mtime
                })
            except Exception:
                pass

    # Prefer names with spaces over underscores when sorting
    courses.sort(key=lambda x: (x["mtime"], ' ' in x["name"]), reverse=True)
    seen_norms = set()
    deduped = []
    for c in courses:
        norm = re.sub(r'[\s_]+', '_', c["name"]).lower()
        if norm in seen_norms:
            continue
        seen_norms.add(norm)
        deduped.append(c)

    return {"success": True, "courses": deduped}

@app.get("/api/media")
def list_media():
    """
    Returns available media assets (videos, audios, images) from public/media directory dynamically.
    """
    media_dir = os.path.join(PUBLIC_DIR, "media")
    videos = []
    audios = []
    images = []
    if os.path.exists(media_dir):
        for f in os.listdir(media_dir):
            low = f.lower()
            if any(low.endswith(ext) for ext in [".mp4", ".webm", ".ogg", ".mov", ".m4v"]):
                videos.append(f)
            elif any(low.endswith(ext) for ext in [".mp3", ".wav", ".m4a", ".aac"]):
                audios.append(f)
            elif any(low.endswith(ext) for ext in [".png", ".jpg", ".jpeg", ".svg", ".gif", ".webp"]):
                images.append(f)
    videos.sort()
    audios.sort()
    images.sort()
    return {"success": True, "videos": videos, "audios": audios, "images": images}

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

@app.post("/api/course/export_scorm")
async def export_scorm_endpoint(payload: dict):
    """
    Dynamically exports and packages the requested course data into a SCORM 2004 4th Edition Zip.
    """
    course_name = payload.get("course_name", "Course")
    raw_name = os.path.basename(course_name).split('?')[0]
    raw_name = re.sub(r'\.html$', '', raw_name, flags=re.IGNORECASE)
    clean_name = re.sub(r'[^a-zA-Z0-9_\- ]', '_', raw_name).strip() or "Course"

    course_data = payload.get("course_data", {})
    if not course_data or "chapters" not in course_data:
        # Check if pre-compiled zip already exists
        norm_req = re.sub(r'[\s_]+', '_', clean_name).lower()
        for f in os.listdir(PUBLIC_DIR):
            if f.endswith('_SCORM2004.zip'):
                f_base = f[:-14]
                if re.sub(r'[\s_]+', '_', f_base).lower() == norm_req:
                    return FileResponse(os.path.join(PUBLIC_DIR, f), filename=f, media_type="application/zip")
        return PlainTextResponse("Course data missing or invalid", status_code=400)

    if "title" not in course_data:
        course_data["title"] = clean_name

    # Build fresh SCORM 2004 zip
    pub_zip_path = os.path.join(PUBLIC_DIR, f"{clean_name}_SCORM2004.zip")
    media_dir = os.path.join(PUBLIC_DIR, "media")
    build_scorm2004_zip(course_data, pub_zip_path, media_dir=media_dir)

    if os.path.exists(DIST_DIR):
        try:
            shutil.copy2(pub_zip_path, os.path.join(DIST_DIR, f"{clean_name}_SCORM2004.zip"))
        except Exception:
            pass

    return FileResponse(pub_zip_path, filename=f"{clean_name}_SCORM2004.zip", media_type="application/zip")

@app.post("/api/course/export_html")
async def export_html_endpoint(payload: dict):
    """
    Dynamically exports and packages the requested course data into a Standalone Single-File HTML.
    """
    course_name = payload.get("course_name", "Course")
    raw_name = os.path.basename(course_name).split('?')[0]
    raw_name = re.sub(r'\.html$', '', raw_name, flags=re.IGNORECASE)
    clean_name = re.sub(r'[^a-zA-Z0-9_\- ]', '_', raw_name).strip() or "Course"

    course_data = payload.get("course_data", {})
    if not course_data or "chapters" not in course_data:
        norm_req = re.sub(r'[\s_]+', '_', clean_name).lower()
        for f in os.listdir(PUBLIC_DIR):
            if f.endswith('.html') and not f.startswith('index'):
                f_base = os.path.splitext(f)[0]
                if re.sub(r'[\s_]+', '_', f_base).lower() == norm_req:
                    return FileResponse(os.path.join(PUBLIC_DIR, f), filename=f, media_type="text/html")
        return PlainTextResponse("Course data missing or invalid", status_code=400)

    if "title" not in course_data:
        course_data["title"] = clean_name

    html_content = generate_standalone_html(course_data)
    pub_html_path = os.path.join(PUBLIC_DIR, f"{clean_name}.html")
    with open(pub_html_path, "w", encoding="utf-8") as f:
        f.write(html_content)

    return Response(
        content=html_content,
        media_type="text/html",
        headers={"Content-Disposition": f'attachment; filename="{clean_name}.html"'}
    )

@app.get("/api/course/download_scorm")
async def download_scorm_by_name(name: str):
    """
    Direct endpoint to download the exact SCORM 2004 zip corresponding to a course name or filename.
    """
    raw_name = urllib.parse.unquote(name).split('?')[0]
    raw_name = re.sub(r'\.html$', '', raw_name, flags=re.IGNORECASE)
    clean_name = re.sub(r'[^a-zA-Z0-9_\- ]', '_', raw_name).strip() or "Course"

    norm_req = re.sub(r'[\s_]+', '_', clean_name).lower()
    for f in os.listdir(PUBLIC_DIR):
        if f.endswith('_SCORM2004.zip'):
            f_base = f[:-14]
            if re.sub(r'[\s_]+', '_', f_base).lower() == norm_req:
                return FileResponse(os.path.join(PUBLIC_DIR, f), filename=f, media_type="application/zip")
            if norm_req in re.sub(r'[\s_]+', '_', f_base).lower():
                return FileResponse(os.path.join(PUBLIC_DIR, f), filename=f, media_type="application/zip")

    return PlainTextResponse(f"SCORM package for {clean_name} not found", status_code=404)

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

@app.post("/api/upload_video")
async def upload_video_endpoint(file: UploadFile = File(...)):
    """
    Uploads a video walkthrough file (.mp4, .webm, .ogg, .mov, .m4v) to media/
    so it can be embedded into video slots and packaged into SCORM 2004 ZIP and standalone HTML.
    """
    media_dir = os.path.join(PUBLIC_DIR, "media")
    os.makedirs(media_dir, exist_ok=True)
    if os.path.exists(ROOT_MEDIA):
        os.makedirs(ROOT_MEDIA, exist_ok=True)

    orig_name = file.filename or f"video_{int(time.time())}.mp4"
    name, ext = os.path.splitext(orig_name)
    clean_base = re.sub(r'[^a-zA-Z0-9_\-]', '_', name).strip('_')
    clean_base = re.sub(r'_+', '_', clean_base)
    if not clean_base:
        clean_base = f"video_{int(time.time())}"
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

    # Also save to root media if it exists
    if os.path.exists(ROOT_MEDIA):
        try:
            with open(os.path.join(ROOT_MEDIA, clean_filename), "wb") as f:
                f.write(content)
        except Exception:
            pass

    # Also save to dist/media if dist exists
    if os.path.exists(DIST_DIR):
        dist_media = os.path.join(DIST_DIR, "media")
        os.makedirs(dist_media, exist_ok=True)
        try:
            with open(os.path.join(dist_media, clean_filename), "wb") as f:
                f.write(content)
        except Exception:
            pass

    return {
        "success": True,
        "video_url": f"media/{clean_filename}",
        "filename": clean_filename,
        "size": len(content)
    }

@app.post("/api/convert")
async def convert_pptx_endpoint(file: UploadFile = File(...)):
    # Save uploaded PPTX or SCORM ZIP to temporary file
    temp_dir = tempfile.mkdtemp(prefix="b2b_conv_")
    try:
        temp_file_path = os.path.join(temp_dir, file.filename)
        with open(temp_file_path, "wb") as f:
            content = await file.read()
            f.write(content)

        is_zip = file.filename.lower().endswith(".zip")
        if is_zip:
            result = ingest_scorm_zip(temp_file_path, output_dir=temp_dir)
            base_name = result.get("course_name") or result.get("filename") or os.path.splitext(file.filename)[0]
        else:
            result = convert_pptx_to_b2b(temp_file_path, output_dir=temp_dir)
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

        # Copy any extracted media and slide images from temp_dir to PUBLIC_DIR and DIST_DIR
        for sub in ["media", "slides"]:
            temp_sub = os.path.join(temp_dir, sub)
            if os.path.exists(temp_sub):
                os.makedirs(os.path.join(PUBLIC_DIR, sub), exist_ok=True)
                if os.path.exists(DIST_DIR):
                    os.makedirs(os.path.join(DIST_DIR, sub), exist_ok=True)
                for f_name in os.listdir(temp_sub):
                    src_f = os.path.join(temp_sub, f_name)
                    if os.path.isfile(src_f):
                        try:
                            shutil.copy2(src_f, os.path.join(PUBLIC_DIR, sub, f_name))
                            if os.path.exists(DIST_DIR):
                                shutil.copy2(src_f, os.path.join(DIST_DIR, sub, f_name))
                        except Exception:
                            pass

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
            "course_data": result.get("course_data", {})
        }
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)

@app.post("/api/upload_scorm")
async def upload_scorm_endpoint(file: UploadFile = File(...)):
    """
    Dedicated endpoint to upload, extract, and ingest a SCORM 2004 Zip Package.
    Returns chapters and media ready for interactive preview and course architecture editing.
    """
    return await convert_pptx_endpoint(file)

DIST_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "dist")
if os.path.exists(DIST_DIR) and os.path.exists(os.path.join(DIST_DIR, "assets")):
    app.mount("/assets", StaticFiles(directory=os.path.join(DIST_DIR, "assets")), name="assets")

@app.api_route("/{full_path:path}", methods=["GET", "HEAD"])
async def serve_static_or_spa(full_path: str):
    no_cache_headers = {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
    }
    unquoted = urllib.parse.unquote(full_path).lstrip("/")
    if unquoted:
        pub_file = os.path.join(PUBLIC_DIR, unquoted)
        if os.path.isfile(pub_file):
            return FileResponse(pub_file, headers=no_cache_headers)

        if os.path.exists(DIST_DIR):
            dist_file = os.path.join(DIST_DIR, unquoted)
            if os.path.isfile(dist_file):
                return FileResponse(dist_file, headers=no_cache_headers)

        # Match case-insensitively or with normalized underscores
        norm = re.sub(r'[\s_]+', '_', unquoted).lower()
        for d in [PUBLIC_DIR, DIST_DIR]:
            if os.path.exists(d):
                for f in os.listdir(d):
                    if re.sub(r'[\s_]+', '_', f).lower() == norm:
                        return FileResponse(os.path.join(d, f), headers=no_cache_headers)

    if os.path.exists(DIST_DIR):
        index_file = os.path.join(DIST_DIR, "index.html")
        if os.path.isfile(index_file):
            return FileResponse(index_file, headers=no_cache_headers)

    return PlainTextResponse("Page Not Found", status_code=404)

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    print(f"Starting server on port {port}...")
    uvicorn.run(app, host="0.0.0.0", port=port)
