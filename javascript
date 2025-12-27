const { readFilesToContextTool } = require('default_api');
readFilesToContextTool({
  file_paths: ["src/pages/Auth.tsx", "src/convex/auth/emailOtp.ts"],
  replace_files_in_context: false
});
