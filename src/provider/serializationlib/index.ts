class SerializationLib {
  private _wasm;
  async load() {
    if (this._wasm) return;
    try {
      this._wasm = await (
        await import("@emurgo/cardano-serialization-lib-browser")
      ).default;
    } catch (error) {
      throw error;
    }
  }
  get Instance() {
    return this._wasm;
  }
}
export default new SerializationLib();
