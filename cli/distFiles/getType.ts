
export const getType = (o: any) => Object.prototype.toString.call(o).match(/\w*\s(\w*)/)![1];
