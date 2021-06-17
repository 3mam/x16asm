
export const header = [
  0x01, 0x08, //address $080D to load program 
  0x0c, 0x08,//address $080c to basic end
  0x01, 0x00, //basic line number
  0x9e,//basic sys function 
  0x32, 0x30, 0x36, 0x31,//2061 in string value, mean $080D in hex
  0x00,//\n
  0x00, 0x00,//end basic program
]