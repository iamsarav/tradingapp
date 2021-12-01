import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ChangeDetectorRef, Input, ViewEncapsulation } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, observable } from 'rxjs';

import { map, catchError, tap } from 'rxjs/operators';
import { Options } from 'selenium-webdriver';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'tradingapp';
  displayedColumns: string[] = ["BidPrice", "Qty", "SumOfQty", "Difference", "BuyVolume", "BuyPrice", "SellPrice", "SellVolume"];
  ApiStarted: any;

  InitialPrice: string;
  RightValue: number;
  RightValuetoDisplay: any;
  public difffenceinPercentage;
  public SumValue;

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
    this.ApiStarted = setInterval(() => {
      this.makeAPICalls()
    }, 500)

  }

  ngOnDestroy() {
    clearInterval(this.ApiStarted);
  }

  public makeAPICalls = () => {
    const dataTable = [];
    var that = this;
    let headers = new HttpHeaders();
    headers.append('Access-Control-Allow-Origin', '*');
    const wazirxAPI = this.http.get<dataResult>(
      'https://x.wazirx.com/api/v2/depth?limit=500&market=usdtinr', { headers: headers }

    ).subscribe(wazirxData => {

      if (wazirxData) {
        this.RightValue = Number(wazirxData.asks[0][0].match(/^-?\d+(?:\.\d{0,2})?/)[0]);
        this.RightValuetoDisplay = Number(wazirxData.asks[0][0].match(/^-?\d+(?:\.\d{0,2})?/)[0]).toFixed(2);

        //Perform this API call only when the response is available for the first API
        const coincdxAPi = this.http.get<dataResult>('https://public.coindcx.com/market_data/orderbook?pair=I-USDT_INR').subscribe(coinCDXdata => {
          this.InitialPrice = Number(Object.keys(coinCDXdata.bids)[0].match(/^-?\d+(?:\.\d{0,2})?/)[0]).toFixed(2);

            let prevBidValues = [];

            let bidsEntries = Object.entries(coinCDXdata.bids).forEach(function (items, index) {
              if (index >= 500) {
                return true
              } else {
                prevBidValues.push(parseFloat(items[1].match(/^-?\d+(?:\.\d{0,2})?/)[0]));

                let bidPrice = Number(items[0]).toFixed(2);
                //display only 2 decimal points
                let Qty = items[1].match(/^-?\d+(?:\.\d{0,2})?/)[0];
                //currency formatting is done below regex
                //Qty = (Qty + "").replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");


                let wazirxDataBuyPrice = Number(wazirxData.bids[index][0]).toFixed(2);
                let wazirxDataBuyVolume = Number(wazirxData.bids[index][1]).toFixed(2);
                let wazirxDataSellPrice = Number(wazirxData.asks[index][0]).toFixed(2);
                let wazirxDataSellVolume = Number(wazirxData.asks[index][1]).toFixed(2);

                // let wazirxDataSellPrice = Object.keys(wazirxData.bids);
                // let wazirxDataSellVolume = Object.keys(wazirxData.bids); 

                const differencePercentage = (bidPrice) => {
                  //that.RightValue = Number(that.RightValue);
                  const difference = bidPrice - that.RightValue;
                  let average = (parseInt(bidPrice) + that.RightValue) / 2;

                  that.difffenceinPercentage = (difference / average) * 100;
                  return that.difffenceinPercentage;

                }
                differencePercentage(bidPrice);

                //Find out the SUM of the Volumes here
                const SumValue = () => {
                  if (prevBidValues.length == 1) {
                    return that.SumValue = prevBidValues[0]
                  }
                  else {
                    let result = prevBidValues.reduce((total, value) => {
                      const acc = total + value;
                      that.SumValue = Math.round((acc + Number.EPSILON) * 100) / 100;
                      return that.SumValue;
                    })
                  }

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
                  "SumOfQty": currencyFormatter(that.SumValue),
                  "Difference": (that.difffenceinPercentage).toFixed(2),
                  "BuyVolume": currencyFormatter(wazirxDataBuyVolume),
                  "BuyPrice": wazirxDataBuyPrice,
                  "SellPrice": wazirxDataSellPrice,
                  "SellVolume": currencyFormatter(wazirxDataSellVolume)
                }
              }

            })
            this.tableData = [...dataTable];
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
