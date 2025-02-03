module.exports = (path, options) => {
  // Appeler le resolver par défaut
  return options.defaultResolver(path, {
    ...options,
    // Vérifier si le module est un module ESM
    packageFilter: pkg => {
      // Utiliser la version ESM si disponible
      if (pkg.module) {
        return { ...pkg, main: pkg.module };
      }
      return pkg;
    },
  });
}; 