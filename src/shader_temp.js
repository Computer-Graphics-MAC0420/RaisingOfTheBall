/**
 * Define o valor de um uniform do tipo vetor 4D
 * @param {string} name - Nome do uniform
 * @param {Float32Array|Array} value - Valor do vetor (4 componentes)
 */
setUniform4fv(name, value) {
  const location = this.#uniforms[name];
  if (location === undefined) {
    console.warn(`Uniform '${name}' não foi definido`);
    return;
  }
  if (location === null) {
    console.warn(`Uniform '${name}' não encontrado no shader`);
    return;
  }

  this.#gl.uniform4fv(location, value);
}
