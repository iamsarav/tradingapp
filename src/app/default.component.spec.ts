
import { Component } from "@angular/core";
import {TestBed, ComponentFixture, async} from "@angular/core/testing";
import { Route, RouterModule, Routes } from "@angular/router";
import { DefaultComponent } from "./default.component";
import { RouterTestingModule} from '@angular/router/testing';

describe("DefaultComponent", () => {
let app:DefaultComponent;
let fixture;

beforeEach(async(
    () => {
        TestBed.configureTestingModule({
            declarations: [
                DefaultComponent
            ],
            imports: [
                RouterModule,
                RouterTestingModule
            ]
        }).compileComponents().then(()=>{
            fixture = TestBed.createComponent(DefaultComponent);
            app = fixture.componentInstance

        })
    }
))

it("Should Test if some text element available"),async(()=>{
    expect(app.header).toEqual("tradingapp");
})



})