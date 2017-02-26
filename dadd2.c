#include <stdio.h>
#include <wiringPi.h>
#include <wiringPiSPI.h>
#include <stdint.h>

#define RED_DATA 0
#define BLUE_DATA 1
#define GREEN_DATA 2

int main(void)
{
  static uint8_t data[4] = {0xEF,0xFF,0xFF,0x04};
  static uint8_t i = 0;

  wiringPiSetup();
  wiringPiSPISetup(0,500000);
  while(1){
	  data[0] = 0xF7;
	  data[2] = 0xFF;
	  data[1] = 0xFF;
	  data[3] = 0x01;
	  wiringPiSPIDataRW(0,data,sizeof(data));
 	  delay(2);
	  data[0] = 0xF3;
          data[2] = 0xFF;
	  data[1] = 0xFF;
   	  data[3] = 0x02;
	  wiringPiSPIDataRW(0,data,sizeof(data));
	  delay(2);
  }
}
