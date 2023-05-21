'use strict';
const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
import mongoose from 'mongoose';
const { Schema } = mongoose;

const stockSchema = new Schema({
  stock: String, // String is shorthand for {type: String}
  ip: String,
  date: { type: Date, default: Date.now }
});

const StockDB = mongoose.model( 'Stock', stockSchema );

chai.use(chaiHttp);

module.exports = function(app) {

  app.route('/api/stock-prices')
    .get(function(req, res) {
      var data = {
        stockData: {
          stock: "",
          price: 0,
          likes: 0
        }
      };
      var stock = req.query['stock'];
      var isArray = Array.isArray( stock );
      var like = req.query[ 'like' ];
      if( isArray ) {
        data.stockData = [];
        var length = stock.length;
        stock.forEach( function( e, i ) {
          chai.request('https://stock-price-checker-proxy.freecodecamp.rocks')
            .get('/v1/stock/' + e + '/quote')
            .then(responses => {
              data.stockData.push( {} );
              var responseJson = JSON.parse( responses.text );
              data.stockData[i].stock = responseJson.symbol;
              data.stockData[i].price = responseJson.latestPrice;
              data.stockData[i].rel_likes = 0;
              console.log( data.stockData[i] );
              if( i >= length - 1 ) {
                res.send( data );
              }
            });
        } );
        //res.send(data);
      } else {
        chai.request('https://stock-price-checker-proxy.freecodecamp.rocks')
        .get('/v1/stock/' + stock + '/quote')
        .then(responses => {
          var responseJson = JSON.parse( responses.text );
          data.stockData.stock = responseJson.symbol;
          data.stockData.price = responseJson.latestPrice;
          data.stockData.likes = 0;
          res.send(data);
        });
      }
      
    });

};