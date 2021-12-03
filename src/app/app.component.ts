import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ChangeDetectorRef, Input, ViewEncapsulation } from '@angular/core';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'tradingapp';
  displayedColumns: string[] = ["BidPrice", "Qty", "SumOfQty", "Difference", "BuyVolume", "BuyPrice", "SellPrice", "SellVolume"];
  apiStarted: any;

  initialPrice: string;
  rightValue: number;
  rightValuetoDisplay: any;
  public difffenceinPercentage;
  public sumValue;
  public suminputvalue: any;
  public percentageinputvalue: any;
  public validateSumPercentageLabel : boolean = false;

  public sumArray: Array<[]> = [];
  public percentageArray: Array<[]> = [];

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
  }
  ngOnInit() {
    this.makeAPICalls();
    this.apiStarted = setInterval(() => {
      this.makeAPICalls()
    }, 500)

  }

  ngOnDestroy() {
    clearInterval(this.apiStarted);
  }

  validateSumAndPercentage = (event?) => {
    if(this.suminputvalue !== undefined && this.suminputvalue !== null && this.percentageinputvalue !== undefined && this.percentageinputvalue !== null && !isNaN(this.suminputvalue) && !isNaN(this.percentageinputvalue)) {
      const sumAvailable = this.sumArray.find((item)=> {        
        return item > this.suminputvalue
      })
      console.log("sumAvailable", sumAvailable);
      const percentageAvailable = this.percentageArray.find((item)=> {
        return item > this.percentageinputvalue
      })

      if(sumAvailable && percentageAvailable) {
        this.validateSumPercentageLabel = true;
      }
      else {
        this.validateSumPercentageLabel = false
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

            let bidsEntries = Object.entries(coinCDXdata.bids).forEach(function (items, index) {
              if (index >= 500) {
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
                //Number(wazirxData.bids[index][1]).toFixed(2);
                let wazirxDataSellPrice = Number(wazirxData.asks[index][0]).toFixed(2);
                let wazirxDataSellVolume = parseInt(wazirxData.asks[index][1]) == 0 ? 1 : parseInt(wazirxData.asks[index][1]); 

                // let wazirxDataSellPrice = Object.keys(wazirxData.bids);
                // let wazirxDataSellVolume = Object.keys(wazirxData.bids); 

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
                SumValue();

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
                  "BuyPrice": wazirxDataBuyPrice,
                  "SellPrice": wazirxDataSellPrice,
                  "SellVolume": currencyFormatter(wazirxDataSellVolume)
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
    this.changeDetectorRef.detectChanges();

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
  Difference?: String;
}
