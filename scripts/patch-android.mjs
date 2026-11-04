import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const file = resolve("android/app/src/main/AndroidManifest.xml");
let xml = readFileSync(file, "utf8");
if (!xml.includes('android:name="android.permission.CAMERA"')) {
  const marker = /(<manifest\b[^>]*>)/;
  if (!marker.test(xml)) throw new Error("AndroidManifest.xml has no manifest root");
  xml = xml.replace(marker, '$1\n    <uses-permission android:name="android.permission.CAMERA" />\n    <uses-feature android:name="android.hardware.camera.any" android:required="false" />');
  writeFileSync(file, xml, "utf8");
}
console.log("Android camera permission declared for barcode scanning.");
