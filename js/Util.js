var IC_MODEL = {
  "0x00" : "SM16703",
  "0x01" : "TM1804",
  "0x02" : "UCS1903",
  "0x03" : "WS2811",
  "0x04" : "WS2801",
  "0x05" : "SK6812",
  "0x06" : "LPD6803",
  "0x07" : "LPD8806",
  "0x08" : "APA102",
  "0x09" : "APA105",
  "0x0A" : "DMX512",
  "0x0B" : "TM1914",
  "0x0C" : "TM1913",
  "0x0D" : "P9813",
  "0x0E" : "INK1003",
  "0x0F" : "P943S",
  "0x10" : "P9411",
  "0x11" : "P9413",
  "0x12" : "TX1812",
  "0x13" : "TX1813",
  "0x14" : "GS8206",
  "0x15" : "GS8208",
  "0x16" : "SK9822",
  "0x17" : "TM1814",
  "0x18" : "SK6812_RGBW",
  "0x19" : "P9414",
  "0x1A" : "PG412"
};

var RGB_SEG = {
  "0x00" : "RGB",
  "0x01" : "RBG",
  "0x02" : "GRB",
  "0x03" : "GBR",
  "0x04" : "BRG",
  "0x05" : "BGR"
};

var MY_PRESET = [
  {
    "ff00001E" : "Red",
    "00ff001E" : "Green",
    "0000ff1E" : "Blue",
    "ffffff1E" : "White"
  },
  {
    "0100002C" : "Rainbow FadeI",
    "0200002C" : "Rainbow FadeO",
    "0300002C" : "Rainbow Chasing",
    "0400002C" : "Rainbow Revert",
  },
  {
    "0500002C" : "Red Chasing",
    "0600002C" : "Green Chasing",
    "0700002C" : "Blue Chasing",
    "0800002C" : "Yellow Chasing"
  }
];

var MY_BRIGHTNESS = [
  {"0000002A" : "0"},
  {"3300002A" : "25"},
  {"7d00002A" : "50"},
  {"be00002A" : "75"},
  {"ff00002A" : "100"},
];

var MY_SPEED = [
  {"00000003" : "0"},
  {"33000003" : "25"},
  {"7d000003" : "50"},
  {"be000003" : "75"},
  {"ff000003" : "100"}
];