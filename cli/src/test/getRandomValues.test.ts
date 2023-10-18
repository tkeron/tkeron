import { getRandomValues } from "../jsDom/crypto";

describe("getRandomValues", () => {
  it("random Int8Array", () => {
    const result = getRandomValues(new Int8Array(5));
    expect(result).toBeTruthy();
    expect(result).toHaveLength(5);
  });
  it("random Uint8Array", () => {
    const result = getRandomValues(new Uint8Array(5));
    expect(result).toBeTruthy();
    expect(result).toHaveLength(5);
  });
  it("random Int16Array", () => {
    const result = getRandomValues(new Int16Array(5));
    expect(result).toBeTruthy();
    expect(result).toHaveLength(5);
  });
  it("random Uint16Array", () => {
    const result = getRandomValues(new Uint16Array(5));
    expect(result).toBeTruthy();
    expect(result).toHaveLength(5);
  });
  it("random Int32Array", () => {
    const result = getRandomValues(new Int32Array(5));
    expect(result).toBeTruthy();
    expect(result).toHaveLength(5);
  });
  it("random Uint32Array", () => {
    const result = getRandomValues(new Uint32Array(5));
    expect(result).toBeTruthy();
    expect(result).toHaveLength(5);
  });
});
