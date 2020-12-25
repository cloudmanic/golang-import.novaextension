class Config {
  //
  // get the config details.
  //
  get(key) {
    let global = nova.config.get(nova.extension.identifier + "." + key);

    let workspace = nova.workspace.config.get(nova.extension.identifier + "." + key);

    // Workspace or Global?
    if (workspace !== null && global !== workspace) {
      return workspace;
    }

    return global;
  }
}

module.exports = Config;
