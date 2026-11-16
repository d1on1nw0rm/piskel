describe("Math utils", function () {
  it("mod keeps values inside the range unchanged", function () {
    expect(pskl.utils.Math.mod(0, 8)).toBe(0);
    expect(pskl.utils.Math.mod(3, 8)).toBe(3);
    expect(pskl.utils.Math.mod(7, 8)).toBe(7);
  });

  it("mod wraps a value equal to the size to zero", function () {
    expect(pskl.utils.Math.mod(8, 8)).toBe(0);
    expect(pskl.utils.Math.mod(16, 8)).toBe(0);
  });

  it("mod wraps values greater than the size", function () {
    expect(pskl.utils.Math.mod(9, 8)).toBe(1);
    expect(pskl.utils.Math.mod(25, 8)).toBe(1);
  });

  it("mod wraps negative values into the range", function () {
    expect(pskl.utils.Math.mod(-1, 8)).toBe(7);
    expect(pskl.utils.Math.mod(-8, 8)).toBe(0);
    expect(pskl.utils.Math.mod(-9, 8)).toBe(7);
    expect(pskl.utils.Math.mod(-17, 8)).toBe(7);
    expect(pskl.utils.Math.mod(-25, 8)).toBe(7);
  });
});
