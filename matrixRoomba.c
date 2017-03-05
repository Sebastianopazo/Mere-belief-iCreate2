
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

  wiringPiSetup();                                // initialize wiringPi
  wiringPiSPISetup(0,500000);           // initialize SPI  information, 0 is channel 0, 500000 is clock rate.


  void out()
   {
    int j;
    int x = 2;
    static uint8_t heart[8] = {0xff,0x81,0x81,0x81,0x81,0x81,0x81,0xff};
    for ( j=0;j<8;j++)
                {
          data[0] = 0xFF;
          data[2] = ~heart[j];
          data[1] = ~heart[j];
          data[3] = ~heart[j]; << j ;
          wiringPiSPIDataRW(0,data,sizeof(data));
          delay(x);
                }
};

    void in()
     {
      int j;
      int x = 2;
      static uint8_t heart[8] = {0x00,0x00,0x3c,0x3c,0x3c,0x3c,0x00,0x00};
      for ( j=0;j<8;j++)
                  {
            data[0] = ~heart[j];
            data[2] = 0xFF;
            data[1] = 0xFF;
            data[3] = 0x01 << j ;
            wiringPiSPIDataRW(0,data,sizeof(data));
            delay(x);
                  }
    };

    void mid()
     {
      int j;
      int x = 2;
      static uint8_t heart[8] = {0x00,0x7e,0x42,0x42,0x42,0x42,0x7e,0x00};
      for ( j=0;j<8;j++)
                  {
            data[0] = 0xFF;
            data[2] = ~heart[j];
            data[1] = 0xFF;
            data[3] = 0x01 << j ;
            wiringPiSPIDataRW(0,data,sizeof(data));
            delay(x);
                  }
    };


    while(1){
         int m = 4;
         for ( m=4; m>0; m--)
            {
             out();
             };
        for ( m=4; m>0; m--)
             {
             mid();
             };
         for ( m=4; m>0; m--)
             {
             in();
             };
         for ( m=4; m>0; m--)
             {
             mid();
             };

        }
}
