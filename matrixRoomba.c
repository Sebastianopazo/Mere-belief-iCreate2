
#include <stdio.h>
#include <wiringPi.h>
#include <wiringPiSPI.h>
#include <stdint.h>

#define RED_DATA 0          //define the red data source
#define BLUE_DATA 1         //define the blue data source
#define GREEN_DATA 2    // define the green data source

int main(void)
{
  static uint8_t data[4] = {0x0,0x0,0x0,0x0};                  // initialize RGB data source
  static uint8_t i = 0;

  wiringPiSetup();                 // initialize wiringPi
  wiringPiSPISetup(0,500000);      // initialize SPI  information, 0 is channel 0, 500000 is clock rate.
  while(1){
    int j;
    int x = 2;
    static uint8_t pixel[1] = {0x66};             // this is a array of heart
    for ( j=3;j<8;j++)
{
          data[0] = ~pixel[j];
          data[2] = 0xFF;
          data[1] = 0xFF;
          data[3] = 0x01 << j ;
          wiringPiSPIDataRW(0,data,sizeof(data));              // send data to SPI channel 0, and the length of the data
          delay(x);
   }
  }


}
