import { Component } from '@angular/core';
 
@Component({
    selector: 'plotly-example',
    templateUrl: './plotly_modelo.component.html'
})

export class PlotlyExampleComponent {
    
      trace2 = {
        x: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 
          10, 9, 8, 7, 6, 5, 4, 3, 2, 1], 
        y: [5.5, 3, 5.5, 8, 6, 3, 8, 5, 6, 5.5, 4.75, 5, 4, 7, 2, 4, 7, 4.4, 2, 4.5], 
        fill: "tozerox", 
        fillcolor: "rgba(0,176,246,0.2)", 
        line: {color: "transparent"}, 
        name: "Premium", 
        showlegend: false, 
        type: "scatter"
      };
    
      trace5 = {
        x: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 
        y: [5, 2.5, 5, 7.5, 5, 2.5, 7.5, 4.5, 5.5, 5], 
        line: {color: "rgb(0,176,246)"}, 
        mode: "lines", 
        name: "Premium", 
        type: "scatter"
      };
    //   trace6 = {// purple line
    //     x: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 
    //     y: [10, 8, 6, 4, 2, 0, 2, 4, 2, 0], 
    //     line: {color: "rgb(231,107,243)"}, 
    //     mode: "lines", 
    //     name: "Ideal", 
    //     type: "scatter"
    //   };

    public graph = {
        data: [this.trace2, this.trace5],
        // layout: {autosize: true, title: 'A Fancy Plot'},
    };
}