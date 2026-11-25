import JSZip from 'jszip';
import { CourseData } from '../types/course';
import { generatePlayerHtml } from './playerTemplate';

const SCORM_WRAPPER_JS = `/**
 * SCORM 2004 4th Edition API Wrapper
 * Standard implementation conforming to ADL SCORM 2004 specifications.
 */
var SCORM2004 = {
  api: null,
  isInitialized: false,
  startTime: null,

  findAPI: function(win) {
    var findAttempts = 0;
    var findAttemptLimit = 500;
    while ((win.API_1484_11 == null) && (win.parent != null) && (win.parent != win)) {
      findAttempts++;
      if (findAttempts > findAttemptLimit) return null;
      win = win.parent;
    }
    return win.API_1484_11;
  },

  getAPI: function() {
    if (this.api == null) {
      if ((window.parent != null) && (window.parent != window)) {
        this.api = this.findAPI(window.parent);
      }
      if ((this.api == null) && (window.opener != null)) {
        this.api = this.findAPI(window.opener);
      }
      if (this.api == null && window.API_1484_11 != null) {
        this.api = window.API_1484_11;
      }
    }
    return this.api;
  },

  initialize: function() {
    var api = this.getAPI();
    if (api == null) {
      console.warn("[SCORM 2004] API_1484_11 not found. Running in standalone LMS fallback mode.");
      return "false";
    }
    var result = api.Initialize("");
    if (result.toString() === "true") {
      this.isInitialized = true;
      this.startTime = new Date();
      // Set initial status if not started
      var status = api.GetValue("cmi.completion_status");
      if (status === "unknown" || status === "not attempted") {
        api.SetValue("cmi.completion_status", "incomplete");
        api.Commit("");
      }
    }
    return result;
  },

  getValue: function(element) {
    var api = this.getAPI();
    if (api && this.isInitialized) {
      return api.GetValue(element);
    }
    return "";
  },

  setValue: function(element, value) {
    var api = this.getAPI();
    if (api && this.isInitialized) {
      var res = api.SetValue(element, value.toString());
      return res;
    }
    return "false";
  },

  commit: function() {
    var api = this.getAPI();
    if (api && this.isInitialized) {
      return api.Commit("");
    }
    return "false";
  },

  terminate: function() {
    var api = this.getAPI();
    if (api && this.isInitialized) {
      // Calculate session time
      if (this.startTime) {
        var elapsed = (new Date() - this.startTime) / 1000;
        this.setValue("cmi.session_time", this.formatIsoDuration(elapsed));
      }
      this.commit();
      var res = api.Terminate("");
      this.isInitialized = false;
      return res;
    }
    return "false";
  },

  formatIsoDuration: function(seconds) {
    var s = Math.floor(seconds % 60);
    var m = Math.floor((seconds / 60) % 60);
    var h = Math.floor(seconds / 3600);
    return "PT" + h + "H" + m + "M" + s + "S";
  }
};

// Global helper bindings
window.scormInitialize = function() { return SCORM2004.initialize(); };
window.scormTerminate = function() { return SCORM2004.terminate(); };
window.scormGetValue = function(elem) { return SCORM2004.getValue(elem); };
window.scormSetValue = function(elem, val) { return SCORM2004.setValue(elem, val); };
window.scormCommit = function() { return SCORM2004.commit(); };

// Auto-cleanup on window unload
window.addEventListener("beforeunload", function() {
  if (SCORM2004.isInitialized) {
    SCORM2004.terminate();
  }
});
`;

export function generateImsManifest(course: CourseData): string {
  const identifier = course.scormSettings.identifier || `COURSE_${Date.now()}`;
  const passingMeasure = ((course.scormSettings.passingScore || 80) / 100).toFixed(2);
  const cleanTitle = escapeXml(course.title);
  const cleanDesc = escapeXml(course.description || course.title);

  return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="${identifier}" version="1.0"
          xmlns="http://www.imsglobal.org/xsd/imscp_v1p1"
          xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_v1p3"
          xmlns:adlseq="http://www.adlnet.org/xsd/adlseq_v1p3"
          xmlns:adlnav="http://www.adlnet.org/xsd/adlnav_v1p3"
          xmlns:imsss="http://www.imsglobal.org/xsd/imsss"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://www.imsglobal.org/xsd/imscp_v1p1 imscp_v1p1.xsd
                              http://www.adlnet.org/xsd/adlcp_v1p3 adlcp_v1p3.xsd
                              http://www.adlnet.org/xsd/adlseq_v1p3 adlseq_v1p3.xsd
                              http://www.adlnet.org/xsd/adlnav_v1p3 adlnav_v1p3.xsd
                              http://www.imsglobal.org/xsd/imsss imsss_v1p0.xsd">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>2004 4th Edition</schemaversion>
    <adlcp:location>metadata.xml</adlcp:location>
  </metadata>
  <organizations default="ORG_${identifier}">
    <organization identifier="ORG_${identifier}">
      <title>${cleanTitle}</title>
      <item identifier="ITEM_${identifier}" identifierref="RES_${identifier}" isvisible="true">
        <title>${cleanTitle}</title>
        <imsss:sequencing>
          <imsss:deliveryControls completionSetByContent="true" objectiveSetByContent="true" />
          <imsss:objectives>
            <imsss:primaryObjective objectiveID="PRIMARY_OBJ" satisfiedByMeasure="true">
              <imsss:minNormalizedMeasure>${passingMeasure}</imsss:minNormalizedMeasure>
            </imsss:primaryObjective>
          </imsss:objectives>
        </imsss:sequencing>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="RES_${identifier}" type="webcontent" adlcp:scormType="sco" href="index.html">
      <file href="index.html" />
      <file href="scormFunctions.js" />
    </resource>
  </resources>
</manifest>`;
}

function escapeXml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Creates and downloads the SCORM 2004 zip package
 */
export async function createScorm2004Package(course: CourseData): Promise<Blob> {
  const zip = new JSZip();

  // 1. imsmanifest.xml
  const manifestXml = generateImsManifest(course);
  zip.file('imsmanifest.xml', manifestXml);

  // 2. scormFunctions.js
  zip.file('scormFunctions.js', SCORM_WRAPPER_JS);

  // 3. index.html (the full course player)
  const indexHtml = generatePlayerHtml(course, true);
  zip.file('index.html', indexHtml);

  // Generate zip blob
  return await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/zip',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 }
  });
}

