
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ChangeDetectorRef, Input, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { share } from 'rxjs/operators';



@Component({
  selector: 'deafult',
  templateUrl: './default.component.html',
  styleUrls: ['./app.component.scss']
})
export class DefaultComponent{
  header = 'tradingapp';
  displayedColumns: string[] = ["BidPrice", "Qty", "SumOfQty", "Difference", "BuyVolume", "BuyVolumeSum", "BuyPrice", "SellPrice","SellVolumeSum", "SellVolume"];
  apiStarted: any;

  initialPrice: string;
  rightValue: number;
  rightValuetoDisplay: any;
  public difffenceinPercentage;
  public sumValue;
  public suminputvalue: any;
  public percentageinputvalue: any;
  public validateSumPercentageLabelVisibilty: boolean = false
  public validateSumPercentageLabel : boolean;
  public validateSumPercentageText: string;

  public sumArray: Array<[]> = [];
  public buyVolumeArray: Array<[]> = [];
  public sellVolumeArray: Array<[]> = [];

  public percentageArray: Array<[]> = [];
  public SUMINPUTKEY: number;
  public PERCENTAGEINPUTKEY: number;

  public dataSource;
  public tableData: tableColumns[] = [
    // {BidPrice: 10, Qty: 10, Sum: 10  },
    // {BidPrice: 10, Qty: 10, Sum: 10  },    
    // {BidPrice: 10, Qty: 10, Sum: 10  },
    // {BidPrice: 10, Qty: 10, Sum: 10  },
    // {BidPrice: 10, Qty: 10, Sum: 10  },
    // {BidPrice: 10, Qty: 10, Sum: 10  },
    // {BidPrice: 10, Qty: 10, Sum: 10  },
    // {BidPrice: 10, Qty: 10, Sum: 10  },
    // {BidPrice: 10, Qty: 10, Sum: 10  },
    // {BidPrice: 10, Qty: 10, Sum: 10  },
    // {BidPrice: 10, Qty: 10, Sum: 10  }    
  ]

  constructor(private http: HttpClient, private changeDetectorRef: ChangeDetectorRef) {
    //this.getFirstAPI();
    this.start();
  }
  ngOnInit() {
    let suminputkey = localStorage.getItem("SUMINPUTKEY");
    let percentageinputkey = localStorage.getItem("PERCENTAGEINPUTKEY");

    if(suminputkey !== undefined && percentageinputkey !== undefined) {
      this.suminputvalue = suminputkey;
      this.percentageinputvalue = percentageinputkey;
      //this.onSubject.next({ key: suminputkey, value: percentageinputkey})
    }
    this.makeAPICalls();
    this.apiStarted = setInterval(() => {
      this.makeAPICalls();
    }, 500)
  }

  private onSubject = new Subject<{ key: string, value: any }>();
  //public changes = this.onSubject.asObservable().pipe(share());

  private start(): void {
    window.addEventListener("storage", this.storageEventListener.bind(this));
  }

  private stop(): void {
    window.removeEventListener("storage", this.storageEventListener.bind(this));
    this.onSubject.complete();
  }

  private storageEventListener(event: StorageEvent) {
    if (event.storageArea == localStorage) {
      
      let v;
      try {         
          v = JSON.parse(event.newValue);
          if(event.key == "SUMINPUTKEY") {
              this.suminputvalue = event.newValue
          }
          else if (event.key == "PERCENTAGEINPUTKEY") {
              this.percentageinputvalue = event.newValue
          }
        }
      catch (e) { v = event.newValue; }
      this.onSubject.next({ key: event.key, value: v });
    }
  }

  ngOnDestroy() {
    clearInterval(this.apiStarted);
    this.stop();
  }

  validateSumAndPercentage = (event?) => {
    if(this.suminputvalue !== undefined && this.suminputvalue !== null && this.percentageinputvalue !== undefined && this.percentageinputvalue !== null && !isNaN(this.suminputvalue) && !isNaN(this.percentageinputvalue)) {

      let oldSUMINPUTKEY = localStorage.getItem("SUMINPUTKEY");
      let oldPERCENTAGEINPUTKEY = localStorage.getItem("PERCENTAGEINPUTKEY");

      localStorage.setItem("SUMINPUTKEY", this.suminputvalue);
      localStorage.setItem("PERCENTAGEINPUTKEY", this.percentageinputvalue);

      this.onSubject.subscribe((value)=> {
        if(value.key == "SUMINPUTKEY") {
          this.suminputvalue = value.value
        }
        else {
          this.percentageinputvalue = value.value
        }
      })
       //this.onSubject.next({ key: event.key, value: v });



      const sumPercentageAvailable = this.tableData.find((item, i)=>{

        if(parseFloat(item.Difference) >= parseFloat(this.percentageinputvalue) && parseInt((item.SumOfQty).replace(/,/g, '')) >= parseInt(this.suminputvalue)) {

          console.log("Condition Met");
          this.validateSumPercentageLabelVisibilty = true;
          return true;

        }
      })

      //Change the Yes No variable to update the button
      if(sumPercentageAvailable) {
        this.validateSumPercentageLabel = true;
        this.validateSumPercentageText = "Yes";
      }  else{
         this.validateSumPercentageLabel = false;
         
        this.validateSumPercentageText = "No";
      } 
      
    }

  }

  public makeAPICalls = () => {
    const dataTable = [];
    var that = this;
    this.sumArray = [];
    this.percentageArray = [];
    let headers = new HttpHeaders();
    headers.append('Access-Control-Allow-Origin', '*');
    const wazirxAPI = this.http.get<dataResult>(
      'https://x.wazirx.com/api/v2/depth?limit=500&market=usdtinr', { headers: headers }

    ).subscribe(wazirxData => {

      if (wazirxData) {
        this.rightValue = Number(wazirxData.asks[0][0].match(/^-?\d+(?:\.\d{0,2})?/)[0]);
        this.rightValuetoDisplay = Number(wazirxData.asks[0][0].match(/^-?\d+(?:\.\d{0,2})?/)[0]).toFixed(2);

        //Perform this API call only when the response is available for the first API
        const coincdxAPi = this.http.get<dataResult>('https://public.coindcx.com/market_data/orderbook?pair=I-USDT_INR').subscribe(coinCDXdata => {
          this.initialPrice = Number(Object.keys(coinCDXdata.bids)[0].match(/^-?\d+(?:\.\d{0,2})?/)[0]).toFixed(2);

            let prevBidValues = [];
            let prevBuyVolumeArray = [];
            let prevSellVolumeArray = [];
            let buyVolumeAccumlator;
            let sellVolumeAccumlator;

            let bidsEntries = Object.entries(coinCDXdata.bids).forEach(function (items, index) {

              let indexFlag = Math.min( wazirxData.bids.length, wazirxData.asks.length, Object.entries(coinCDXdata.bids).length);
              if (index >= indexFlag-1) {
                return true
              } else {
                prevBidValues.push(parseFloat(items[1].match(/^-?\d+(?:\.\d{0,2})?/)[0]));

                let bidPrice = Number(items[0]).toFixed(2);
                //display only 2 decimal points
                //let Qty = items[1].match(/^-?\d+(?:\.\d{0,0})?/)[0];
                
                //parsing the Qty value not to display the decimal points
                let Qty = parseInt(items[1]) == 0 ? 1 : parseInt(items[1]);


                let wazirxDataBuyPrice = Number(wazirxData.bids[index][0]).toFixed(2);
                let wazirxDataBuyVolume = parseInt(wazirxData.bids[index][1]) == 0 ? 1 : parseInt(wazirxData.bids[index][1]);
                let wazirxDataSellPrice = Number(wazirxData.asks[index][0]).toFixed(2);
                let wazirxDataSellVolume = parseInt(wazirxData.asks[index][1]) == 0 ? 1 : parseInt(wazirxData.asks[index][1]); 

                prevBuyVolumeArray.push(wazirxDataBuyVolume);
                prevSellVolumeArray.push(wazirxDataSellVolume);

                const differencePercentage = (bidPrice) => {
                  //that.RightValue = Number(that.RightValue);
                  const difference = bidPrice - that.rightValue;
                  let average = (parseInt(bidPrice) + that.rightValue) / 2;

                  that.difffenceinPercentage = (difference / average) * 100;
                  that.percentageArray.push((that.difffenceinPercentage).toFixed(2));
                  return that.difffenceinPercentage;

                }
                differencePercentage(bidPrice);

                //Find out the SUM of the Volumes here
                const SumValue = () => {
                  if (prevBidValues.length == 1) {
                    return that.sumValue =  parseInt(prevBidValues[0]) == 0  ? 1 : parseInt(prevBidValues[0])
                  }
                  else {
                    let result = prevBidValues.reduce((total, value) => {
                      const acc = total + value;
                      //that.sumValue = Math.round((acc + Number.EPSILON) * 100) / 100;
                      that.sumValue = parseInt(acc) == 0  ? 1 : parseInt(acc);
                      
                      return that.sumValue;
                    })
                  }
                  that.sumArray.push(that.sumValue);

                }
                const SumBuyVolume = () => {
                  if (prevBuyVolumeArray.length == 1) {
                    return buyVolumeAccumlator =  parseInt(prevBuyVolumeArray[0]) == 0  ? 1 : parseInt(prevBuyVolumeArray[0])
                  }
                  else {
                    
                    let result = prevBuyVolumeArray.reduce((total, value) => {
                      const acc = total + value;
                      //that.sumValue = Math.round((acc + Number.EPSILON) * 100) / 100;
                      buyVolumeAccumlator = parseInt(acc) == 0  ? 1 : parseInt(acc);
                      return buyVolumeAccumlator;
                    })
                  }
                  that.buyVolumeArray.push(buyVolumeAccumlator);

                }

                const SumSellVolume = () => {
                  if (prevSellVolumeArray.length == 1) {
                    return sellVolumeAccumlator =  parseInt(prevSellVolumeArray[0]) == 0  ? 1 : parseInt(prevSellVolumeArray[0])
                  }
                  else {
                    
                    let result = prevSellVolumeArray.reduce((total, value) => {
                      const acc = total + value;
                      //that.sumValue = Math.round((acc + Number.EPSILON) * 100) / 100;
                      sellVolumeAccumlator = parseInt(acc) == 0  ? 1 : parseInt(acc);
                      return sellVolumeAccumlator;
                    })
                  }
                  that.sellVolumeArray.push(sellVolumeAccumlator);

                }

                

                SumValue();
                SumBuyVolume();
                SumSellVolume();

                const currencyFormatter = (input) => {
                  //var x=12345652457.557;
                  input = input.toString();
                  var afterPoint = '';
                  if (input.indexOf('.') > 0)
                    afterPoint = input.substring(input.indexOf('.'), input.length);
                  input = Math.floor(input);
                  input = input.toString();
                  var lastThree = input.substring(input.length - 3);
                  var otherNumbers = input.substring(0, input.length - 3);
                  if (otherNumbers != '')
                    lastThree = ',' + lastThree;
                  var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree + afterPoint;
                  return res
                }
                dataTable[index] = {
                  "BidPrice": bidPrice,
                  "Qty": currencyFormatter(Qty),
                  "SumOfQty": currencyFormatter(that.sumValue),
                  "Difference": (that.difffenceinPercentage).toFixed(2),
                  "BuyVolume": currencyFormatter(wazirxDataBuyVolume),
                  "BuyVolumeSum" : currencyFormatter(buyVolumeAccumlator),
                  "BuyPrice": wazirxDataBuyPrice,
                  "SellPrice": wazirxDataSellPrice,
                  "SellVolume": currencyFormatter(wazirxDataSellVolume),                  
                  "SellVolumeSum" : currencyFormatter(sellVolumeAccumlator)
                }
              }

            })
            this.tableData = [...dataTable];
            this.validateSumAndPercentage();
            this.changeDetectorRef.detectChanges();
            return this.tableData;  
        })

      }
    })
    //this.changeDetectorRef.detectChanges();

  }
}
export interface dataResult {
  bids: string[];
  asks: string[];
}

export interface tableColumns {
  BidPrice: string[];
  Qty: string[];
  Sum?: string;
  Difference?: string;
  SumOfQty: string;
}
