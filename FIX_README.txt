=== PDF READER FIX — REQUIRED STEPS ===

The PDF worker version mismatch is fixed by pinning pdfjs-dist to 5.4.296.
You MUST run a fresh install for this to take effect:

  1. Delete node_modules folder
  2. Delete package-lock.json  (if it exists)
  3. Run:  npm install
  4. Then: npm start

That's it. The reader will work after a fresh install.

WHY: react-pdf@10.4.1 internally uses pdfjs-dist@5.4.296, but the old
package.json had pdfjs-dist@^5.6.205 in node_modules. The worker from
5.6.205 doesn't match react-pdf's 5.4.296 API. Now both are pinned to
the same version (5.4.296) via package.json overrides.
