var IC_MODEL = {
  "00" : "SM16703",
  "01" : "TM1804",
  "02" : "UCS1903",
  "03" : "WS2811",
  "04" : "WS2801",
  "05" : "SK6812",
  "06" : "LPD6803",
  "07" : "LPD8806",
  "08" : "APA102",
  "09" : "APA105",
  "0A" : "DMX512",
  "0B" : "TM1914",
  "0C" : "TM1913",
  "0D" : "P9813",
  "0E" : "INK1003",
  "0F" : "P943S",
  "10" : "P9411",
  "11" : "P9413",
  "12" : "TX1812",
  "13" : "TX1813",
  "14" : "GS8206",
  "15" : "GS8208",
  "16" : "SK9822",
  "17" : "TM1814",
  "18" : "SK6812_RGBW",
  "19" : "P9414",
  "1A" : "PG412"
};

var RGB_SEG = {
  "00" : "RGB",
  "01" : "RBG",
  "02" : "GRB",
  "03" : "GBR",
  "04" : "BRG",
  "05" : "BGR"
};

var MY_PRESET = [
  {
    "000000aa" : "Turn On",
    "00ff00ab" : "Turn Off",
    "ff00001E" : "Red",
    "00ff001E" : "Green",
    "0000ff1E" : "Blue",
    "ffffff1E" : "White",
    "0100002C" : "Rainbow FadeI",
    "0200002C" : "Rainbow FadeO",
    "0300002C" : "Rainbow Chasing",
    "0400002C" : "Rainbow Revert",
    "0500002C" : "Red Chasing",
    "0600002C" : "Green Chasing",
    "0700002C" : "Blue Chasing",
    "0800002C" : "Yellow Chasing",
    "1700002C" : "Red White"
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