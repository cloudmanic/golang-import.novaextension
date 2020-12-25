const Config = require("./Config");
const Formatter = require("./Formatter");

//
// On activate
//
exports.activate = function () {
  const config = new Config();
  const formatter = new Formatter(config);
  const executablePath = nova.extension.path + "/Vendor/goimports";
  console.info("Starting " + nova.extension.identifier);

  // Make sure we can execute this binary.
  var chmodProc = new Process("/bin/chmod", { args: ["755", executablePath] });
  chmodProc.start();

  nova.workspace.onDidAddTextEditor((editor) => {
    // Only interested in Golang code.
    if (editor.document.syntax != "go") {
      return;
    }

    // Run just before save.
    editor.onWillSave((editor) => {
      // Format on save
      if (config.get("formatOnSave")) {
        formatter.format(editor, true);
      }
    });
  });

  // Register the import command
  nova.commands.register("runGoImport", (editor) => {
    formatter.format(editor, false);
  });
};
