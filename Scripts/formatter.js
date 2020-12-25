class Formatter {
  //
  // Construct.
  //
  constructor(config) {
    this.config = config;
  }

  //
  // get the process we are going to run.
  //
  async getProcess(filePath) {
    const executablePath = nova.extension.path + "/Vendor/goimports";

    // Make sure we can execute this binary.
    var chmodProc = new Process("/bin/chmod", { args: ["755", executablePath] });
    chmodProc.start();

    var options = [filePath];

    return new Process(executablePath, {
      args: Array.from(new Set(options)),
      stdio: "pipe",
      cwd: nova.workspace.path, // NOTE: must be explicitly set
    });
  }

  //
  // Format the document via goimports
  //
  async format(editor, onSave = false) {
    // Document can't be empty
    if (editor.document.isEmpty) {
      return;
    }

    const textRange = new Range(0, editor.document.length);
    const content = editor.document.getTextInRange(textRange);
    const filePath = nova.workspace.relativizePath(editor.document.path);

    let outBuffer = [];
    let errBuffer = [];

    const process = await this.getProcess(filePath);

    if (!process) {
      return;
    }

    // Setup process events
    process.onStdout((output) => outBuffer.push(output));
    process.onStderr((error) => errBuffer.push(error));
    process.onDidExit((status) => {
      if (status === 0) {
        const formattedContent = outBuffer.join("");

        editor.edit((edit) => {
          if (formattedContent !== content) {
            console.log("Formatting " + filePath);
            edit.replace(textRange, formattedContent);
          } else {
            console.log("Nothing to format");
          }
        });

        // NOTE: it's the only way to really-really save a file
        if (onSave) {
          editor.save();
        }
      } else {
        console.error(errBuffer.join(""));
      }
    });

    // Run the process.
    console.log("Running " + process.command + " " + process.args.join(" "));
    process.start();

    const writer = process.stdin.getWriter();

    writer.ready.then(() => {
      writer.write(content);
      writer.close();
    });
  }
}

module.exports = Formatter;
