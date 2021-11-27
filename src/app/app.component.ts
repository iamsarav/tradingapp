import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ChangeDetectorRef  } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, observable } from 'rxjs';

import { map, catchError, tap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'tradingapp';
  displayedColumns: string[] = ["BidPrice", "Qty", "SumOfQty"];
  ApiStarted: any;
  
  InitialPrice: string;
  RightValue: number;

  public dataSource;
  public tableData:tableColumns[] = [
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
    this.ApiStarted = setInterval(()=> {
      //this.makeAPICalls()
    },500)
    
  }

  ngOnDestroy() {
    clearInterval(this.ApiStarted);
  }

  public makeAPICalls = () => {
      const dataTable = [];   
      
      const wazirxAPI = this.http.get<dataResult>('https://x.wazirx.com/api/v2/depth?limit=10&market=usdtinr').subscribe( response => {
        if(response) {
          console.log(response.asks);
          return this.RightValue = Number(response.asks[0][0]);
        }
      });

      var that = this;
      const coincdxAPi =  this.http.get<dataResult>('https://public.coindcx.com/market_data/orderbook?pair=I-USDT_INR').subscribe(data => {
        
        this.InitialPrice = Object.keys(data.bids)[0].match(/^-?\d+(?:\.\d{0,2})?/)[0];
        let prevBidValues = [];
      
          let bidsEntries = Object.entries(data.bids).forEach(function(items, index) {
            
            prevBidValues.push(parseFloat(items[1].match(/^-?\d+(?:\.\d{0,2})?/)[0]));

            const bidPrice = items[0].match(/^-?\d+(?:\.\d{0,2})?/)[0];
            const Qty = items[1].match(/^-?\d+(?:\.\d{0,2})?/)[0];

            const differencePercentage = (bidPrice) => {
              const difference = that.RightValue - parseInt(bidPrice) 
              let average = (parseInt(bidPrice) + that.RightValue) / 2; 
              // let percentageDifference = (difference / average) * 100;
              // console.log("percentage", percentageDifference);
              // return percentageDifference;

              const difffencePercentage = (difference / average ) * 100;
              console.log("difffencePercentage", difffencePercentage);
              return differencePercentage;

            }
            differencePercentage(bidPrice);

            dataTable[index] = {
              "BidPrice": bidPrice,
              "Qty": Qty,
              "SumOfQty": prevBidValues.reduce((total, value) => { 
                const acc = total + value;
                let result = Math.round((acc + Number.EPSILON) * 100) / 100;
                return result;
                }
              ),
              
            }
          
        })
        this.tableData = [...dataTable];
        console.log("tableData", this.tableData)
        this.changeDetectorRef.detectChanges();
        return this.tableData;    
        

      })

     
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