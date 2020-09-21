import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { NgbTabsetConfig } from '@ng-bootstrap/ng-bootstrap';

const tabset = {
		beforeCodeTitle: 'Tabset',
		htmlCode: `
<div class="kt-section">
  <div class="kt-section__content">
  <ngb-tabset>
    <ngb-tab title="Simple">
      <ng-template ngbTabContent>
        <p>Raw denim you probably haven't heard of them jean shorts Austin. Nesciunt tofu stumptown aliqua, retro synth
          master cleanse. Mustache cliche tempor, williamsburg carles vegan helvetica. Reprehenderit butcher retro keffiyeh
          dreamcatcher synth. Cosby sweater eu banh mi, qui irure terry richardson ex squid. Aliquip placeat salvia cillum
          iphone. Seitan aliquip quis cardigan american apparel, butcher voluptate nisi qui.</p>
      </ng-template>
    </ngb-tab>
    <ngb-tab>
    <ng-template ngbTabTitle><b>Fancy</b> title</ng-template>
    <ng-template ngbTabContent>Food truck fixie locavore, accusamus mcsweeney's marfa nulla single-origin coffee squid.
      <p>Exercitation +1 labore velit, blog sartorial PBR leggings next level wes anderson artisan four loko farm-to-table
        craft beer twee. Qui photo booth letterpress, commodo enim craft beer mlkshk aliquip jean shorts ullamco ad vinyl
        cillum PBR. Homo nostrud organic, assumenda labore aesthetic magna delectus mollit. Keytar helvetica VHS salvia
        yr, vero magna velit sapiente labore stumptown. Vegan fanny pack odio cillum wes anderson 8-bit, sustainable jean
        shorts beard ut DIY ethical culpa terry richardson biodiesel. Art party scenester stumptown, tumblr butcher vero
        sint qui sapiente accusamus tattooed echo park.</p>
      </ng-template>
      </ngb-tab>
      <ngb-tab title="Disabled" [disabled]="true">
        <ng-template ngbTabContent>
		  <p>Sed commodo, leo at suscipit dictum, quam est porttitor sapien, eget sodales nibh elit id diam. Nulla facilisi.
			Donec egestas ligula vitae odio interdum aliquet. Duis lectus turpis, luctus eget tincidunt eu, congue et odio.
			Duis pharetra et nisl at faucibus. Quisque luctus pulvinar arcu, et molestie lectus ultrices et. Sed diam urna,
			egestas ut ipsum vel, volutpat volutpat neque. Praesent fringilla tortor arcu. Vivamus faucibus nisl enim, nec
			tristique ipsum euismod facilisis. Morbi ut bibendum est, eu tincidunt odio. Orci varius natoque penatibus et
			magnis dis parturient montes, nascetur ridiculus mus. Mauris aliquet odio ac lorem aliquet ultricies in eget neque.
            Phasellus nec tortor vel tellus pulvinar feugiat.</p>
        </ng-template>
      </ngb-tab>
	</ngb-tabset>
  </div>
</div>
`,
		tsCode: `
import {Component} from '@angular/core';

@Component({
    selector: 'ngbd-tabset-basic',
    templateUrl: './tabset-basic.html'
})
export class NgbdTabsetBasic { }
`,
		viewCode: ``,
		isCodeVisible: false,
		isExampleExpanded: true
	};

const pills = {
		beforeCodeTitle: 'Pills',
		htmlCode: `
<div class="kt-section">
  <div class="kt-section__content">
  <ngb-tabset type="pills">
    <ngb-tab title="Simple">
      <ng-template ngbTabContent>
        <p>Raw denim you probably haven't heard of them jean shorts Austin. Nesciunt tofu stumptown aliqua, retro synth
          master cleanse. Mustache cliche tempor, williamsburg carles vegan helvetica. Reprehenderit butcher retro keffiyeh
          dreamcatcher synth. Cosby sweater eu banh mi, qui irure terry richardson ex squid. Aliquip placeat salvia cillum
          iphone. Seitan aliquip quis cardigan american apparel, butcher voluptate nisi qui.</p>
      </ng-template>
    </ngb-tab>
    <ngb-tab>
      <ng-template ngbTabTitle><b>Fancy</b> title</ng-template>
      <ng-template ngbTabContent>Food truck fixie locavore, accusamus mcsweeney's marfa nulla single-origin coffee squid.
        <p>Exercitation +1 labore velit, blog sartorial PBR leggings next level wes anderson artisan four loko farm-to-table
          craft beer twee. Qui photo booth letterpress, commodo enim craft beer mlkshk aliquip jean shorts ullamco ad vinyl
		  cillum PBR. Homo nostrud organic, assumenda labore aesthetic magna delectus mollit. Keytar helvetica VHS salvia
          yr, vero magna velit sapiente labore stumptown. Vegan fanny pack odio cillum wes anderson 8-bit, sustainable jean
          shorts beard ut DIY ethical culpa terry richardson biodiesel. Art party scenester stumptown, tumblr butcher vero
          sint qui sapiente accusamus tattooed echo park.</p>
        </ng-template>
      </ngb-tab>
      <ngb-tab title="Disabled" [disabled]="true">
        <ng-template ngbTabContent>
		  <p>Sed commodo, leo at suscipit dictum, quam est porttitor sapien, eget sodales nibh elit id diam. Nulla facilisi.
			Donec egestas ligula vitae odio interdum aliquet. Duis lectus turpis, luctus eget tincidunt eu, congue et odio.
			Duis pharetra et nisl at faucibus. Quisque luctus pulvinar arcu, et molestie lectus ultrices et. Sed diam urna,
			egestas ut ipsum vel, volutpat volutpat neque. Praesent fringilla tortor arcu. Vivamus faucibus nisl enim, nec
			tristique ipsum euismod facilisis. Morbi ut bibendum est, eu tincidunt odio. Orci varius natoque penatibus et
			magnis dis parturient montes, nascetur ridiculus mus. Mauris aliquet odio ac lorem aliquet ultricies in eget neque.
			Phasellus nec tortor vel tellus pulvinar feugiat.
          </p>
        </ng-template>
      </ngb-tab>
	</ngb-tabset>
  </div>
</div>
`,
		tsCode: `

import {Component} from '@angular/core';\n
@Component({
    selector: 'ngbd-tabset-pills',
    templateUrl: './tabset-pills.html'
})
export class NgbdTabsetPills { }
`,
		viewCode: ``,
		isCodeVisible: false
	};


const selectAnActiveTabById = {
		beforeCodeTitle: 'Select an active tab by id',
		htmlCode: `
<div class="kt-section">
  <div class="kt-section__content">
    <ngb-tabset #t="ngbTabset">
      <ngb-tab id="tab-selectbyid1" title="Simple">
        <ng-template ngbTabContent>
	      <p>Raw denim you probably haven't heard of them jean shorts Austin. Nesciunt tofu stumptown aliqua, retro synth
            master cleanse. Mustache cliche tempor, williamsburg carles vegan helvetica. Reprehenderit butcher retro keffiyeh
            dreamcatcher synth. Cosby sweater eu banh mi, qui irure terry richardson ex squid. Aliquip placeat salvia cillum
            iphone. Seitan aliquip quis cardigan american apparel, butcher voluptate nisi qui.</p>
        </ng-template>
      </ngb-tab>
      <ngb-tab id="tab-selectbyid2">
        <ng-template ngbTabTitle><b>Fancy</b> title</ng-template>
        <ng-template ngbTabContent>Food truck fixie locavore, accusamus mcsweeney's marfa nulla single-origin coffee squid.
          <p>Exercitation +1 labore velit, blog sartorial PBR leggings next level wes anderson artisan four loko farm-to-table
            craft beer twee. Qui photo booth letterpress, commodo enim craft beer mlkshk aliquip jean shorts ullamco ad vinyl
            cillum PBR. Homo nostrud organic, assumenda labore aesthetic magna delectus mollit. Keytar helvetica VHS salvia
            yr, vero magna velit sapiente labore stumptown. Vegan fanny pack odio cillum wes anderson 8-bit, sustainable jean
            shorts beard ut DIY ethical culpa terry richardson biodiesel. Art party scenester stumptown, tumblr butcher vero
            sint qui sapiente accusamus tattooed echo park.</p>
	    </ng-template>
      </ngb-tab>
    </ngb-tabset>
  </div>
</div>
<div class="kt-separator kt-separator--dashed"></div>
<div class="kt-section">
  <div class="kt-section__content">
	<button class="btn btn-outline-primary" (click)="t.select('tab-selectbyid2')">Selected tab with "tab-selectbyid2"
      id</button>
  </div>
</div>
`,
		tsCode: `
import {Component} from '@angular/core';\n
@Component({
    selector: 'ngbd-tabset-selectbyid',
    templateUrl: './tabset-selectbyid.html'
})
export class NgbdTabsetSelectbyid {
}
 `,
		viewCode: ``,
		isCodeVisible: false
	};

const preventTabChange = {
		beforeCodeTitle: 'Prevent tab change',
		htmlCode: `
<div class="kt-section">
  <div class="kt-section__content">
    <ngb-tabset (tabChange)="beforeChange($event)">
      <ngb-tab id="tab-preventchange1" title="Simple">
        <ng-template ngbTabContent>
          <p>Raw denim you probably haven't heard of them jean shorts Austin. Nesciunt tofu stumptown aliqua, retro synth
            master cleanse. Mustache cliche tempor, williamsburg carles vegan helvetica. Reprehenderit butcher retro keffiyeh
            dreamcatcher synth. Cosby sweater eu banh mi, qui irure terry richardson ex squid. Aliquip placeat salvia cillum
            iphone. Seitan aliquip quis cardigan american apparel, butcher voluptate nisi qui.</p>
        </ng-template>
      </ngb-tab>
      <ngb-tab id="tab-preventchange2" title="I can't be selected...">
        <ng-template ngbTabContent>Food truck fixie locavore, accusamus mcsweeney's marfa nulla single-origin coffee squid.
          <p>Exercitation +1 labore velit, blog sartorial PBR leggings next level wes anderson artisan four loko farm-to-table
            craft beer twee. Qui photo booth letterpress, commodo enim craft beer mlkshk aliquip jean shorts ullamco ad vinyl
		    cillum PBR. Homo nostrud organic, assumenda labore aesthetic magna delectus mollit. Keytar helvetica VHS salvia
            yr, vero magna velit sapiente labore stumptown. Vegan fanny pack odio cillum wes anderson 8-bit, sustainable jean
            shorts beard ut DIY ethical culpa terry richardson biodiesel. Art party scenester stumptown, tumblr butcher vero
            sint qui sapiente accusamus tattooed echo park.</p>
        </ng-template>
      </ngb-tab>
      <ngb-tab title="But I can!" >
        <ng-template ngbTabContent>
		  <p>Sed commodo, leo at suscipit dictum, quam est porttitor sapien, eget sodales nibh elit id diam. Nulla facilisi.
		  Donec egestas ligula vitae odio interdum aliquet. Duis lectus turpis, luctus eget tincidunt eu, congue et odio.
		  Duis pharetra et nisl at faucibus. Quisque luctus pulvinar arcu, et molestie lectus ultrices et. Sed diam urna,
		  egestas ut ipsum vel, volutpat volutpat neque. Praesent fringilla tortor arcu. Vivamus faucibus nisl enim, nec
		  tristique ipsum euismod facilisis. Morbi ut bibendum est, eu tincidunt odio. Orci varius natoque penatibus et magnis
		  dis parturient montes, nascetur ridiculus mus. Mauris aliquet odio ac lorem aliquet ultricies in eget neque. Phasellus
		  nec tortor vel tellus pulvinar feugiat.
          </p>
        </ng-template>
      </ngb-tab>
	</ngb-tabset>
  </div>
</div>
`,
		tsCode: `
import {Component} from '@angular/core';
import {NgbTabChangeEvent} from '@ng-bootstrap/ng-bootstrap';\n
@Component({
    selector: 'ngbd-tabset-preventchange',
    templateUrl: './tabset-preventchange.html'
})
export class NgbdTabsetPreventchange {
    public beforeChange($event: NgbTabChangeEvent) {
        if ($event.nextId === 'tab-preventchange2') {
            $event.preventDefault();
        }
	};
}
	`,
		viewCode: ``,
		isCodeVisible: false
	};

const navJustification = {
		beforeCodeTitle: 'Nav justification',
		htmlCode: `
<div class="kt-section">
  <div class="kt-section__content">
    <ngb-tabset [justify]="currentJustify">
      <ngb-tab title="Simple">
        <ng-template ngbTabContent>
          <p>Raw denim you probably haven't heard of them jean shorts Austin. Nesciunt tofu stumptown aliqua, retro synth
            master cleanse. Mustache cliche tempor, williamsburg carles vegan helvetica. Reprehenderit butcher retro keffiyeh
            dreamcatcher synth. Cosby sweater eu banh mi, qui irure terry richardson ex squid. Aliquip placeat salvia cillum
            iphone. Seitan aliquip quis cardigan american apparel, butcher voluptate nisi qui.</p>
        </ng-template>
      </ngb-tab>
      <ngb-tab>
        <ng-template ngbTabTitle><b>Fancy</b> title</ng-template>
        <ng-template ngbTabContent>Food truck fixie locavore, accusamus mcsweeney's marfa nulla single-origin coffee squid.
          <p>Exercitation +1 labore velit, blog sartorial PBR leggings next level wes anderson artisan four loko farm-to-table
            craft beer twee. Qui photo booth letterpress, commodo enim craft beer mlkshk aliquip jean shorts ullamco ad vinyl
            cillum PBR. Homo nostrud organic, assumenda labore aesthetic magna delectus mollit. Keytar helvetica VHS salvia
            yr, vero magna velit sapiente labore stumptown. Vegan fanny pack odio cillum wes anderson 8-bit, sustainable jean
            shorts beard ut DIY ethical culpa terry richardson biodiesel. Art party scenester stumptown, tumblr butcher vero
            sint qui sapiente accusamus tattooed echo park.</p>
        </ng-template>
      </ngb-tab>
      <ngb-tab title="A very long nav title">
        <ng-template ngbTabContent>
		  <p>Sed commodo, leo at suscipit dictum, quam est porttitor sapien, eget sodales nibh elit id diam. Nulla facilisi.
            Donec egestas ligula vitae odio interdum aliquet. Duis lectus turpis, luctus eget tincidunt eu,
			congue et odio. Duis pharetra et nisl at faucibus. Quisque luctus pulvinar arcu, et molestie lectus ultrices et.
            Sed diam urna, egestas ut ipsum vel, volutpat volutpat neque. Praesent fringilla tortor arcu.
			Vivamus faucibus nisl enim, nec tristique ipsum euismod facilisis. Morbi ut bibendum est, eu tincidunt odio.
			Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Mauris aliquet odio ac
            lorem aliquet ultricies in eget neque. Phasellus nec tortor vel tellus pulvinar feugiat.</p>
        </ng-template>
      </ngb-tab>
    </ngb-tabset>
  </div>
</div>
<div class="kt-separator kt-separator--dashed"></div>
<div class="kt-section">
  <div class="kt-section__content">
    <div class="btn-group btn-group-toggle" ngbRadioGroup [(ngModel)]="currentJustify">
      <label ngbButtonLabel class="btn-outline-primary btn-sm">
        <input ngbButton type="radio" value="start">Start
      </label>
	  <label ngbButtonLabel class="btn-outline-primary btn-sm">
        <input ngbButton type="radio" value="center">Center
      </label>
      <label ngbButtonLabel class="btn-outline-primary btn-sm">
        <input ngbButton type="radio" value="end">End
      </label>
	  <label ngbButtonLabel class="btn-outline-primary btn-sm">
        <input ngbButton type="radio" value="fill">Fill
      </label>
      <label ngbButtonLabel class="btn-outline-primary btn-sm">
        <input ngbButton type="radio" value="justified">Justified
      </label>
	</div>
  </div>
</div>
		`,
		tsCode: `
import {Component} from '@angular/core';\n
@Component({
    selector: 'ngbd-tabset-justify',
    templateUrl: './tabset-justify.html'
})
export class NgbdTabsetJustify {
    currentJustify = 'start';
}
`,
		viewCode: ``,
		isCodeVisible: false
	};

const navOrientation = {
		beforeCodeTitle: 'Nav orientation',
		htmlCode: `
<div class="kt-section">
  <div class="kt-section__content">
    <ngb-tabset type="pills" [orientation]="currentOrientation">
      <ngb-tab title="Simple">
        <ng-template ngbTabContent>
          <p>Raw denim you probably haven't heard of them jean shorts Austin. Nesciunt tofu stumptown aliqua, retro synth
            master cleanse. Mustache cliche tempor, williamsburg carles vegan helvetica. Reprehenderit butcher retro keffiyeh
            dreamcatcher synth. Cosby sweater eu banh mi, qui irure terry richardson ex squid. Aliquip placeat salvia cillum
            iphone. Seitan aliquip quis cardigan american apparel, butcher voluptate nisi qui.</p>
        </ng-template>
      </ngb-tab>
	  <ngb-tab>
		<ng-template ngbTabTitle><b>Fancy</b> title</ng-template>
        <ng-template ngbTabContent>Food truck fixie locavore, accusamus mcsweeney's marfa nulla single-origin coffee squid.
          <p>Exercitation +1 labore velit, blog sartorial PBR leggings next level wes anderson artisan four loko farm-to-table
            craft beer twee. Qui photo booth letterpress, commodo enim craft beer mlkshk aliquip jean shorts ullamco ad vinyl
            cillum PBR. Homo nostrud organic, assumenda labore aesthetic magna delectus mollit. Keytar helvetica VHS salvia
            yr, vero magna velit sapiente labore stumptown. Vegan fanny pack odio cillum wes anderson 8-bit, sustainable jean
            shorts beard ut DIY ethical culpa terry richardson biodiesel. Art party scenester stumptown, tumblr butcher vero
            sint qui sapiente accusamus tattooed echo park.</p>
        </ng-template>
      </ngb-tab>
      <ngb-tab title="Disabled" [disabled]="true">
        <ng-template ngbTabContent>
		  <p>Sed commodo, leo at suscipit dictum, quam est porttitor sapien, eget sodales nibh elit id diam. Nulla facilisi.
			Donec egestas ligula vitae odio interdum aliquet. Duis lectus turpis, luctus eget tincidunt eu, congue et odio.
			Duis pharetra et nisl at faucibus. Quisque luctus pulvinar arcu, et molestie lectus ultrices et. Sed diam urna,
			egestas ut ipsum vel, volutpat volutpat neque. Praesent fringilla tortor arcu. Vivamus faucibus nisl enim, nec
			tristique ipsum euismod facilisis. Morbi ut bibendum est, eu tincidunt odio. Orci varius natoque penatibus et
			magnis dis parturient montes, nascetur ridiculus mus. Mauris aliquet odio ac lorem aliquet ultricies in eget neque.
			Phasellus nec tortor vel tellus pulvinar feugiat.
          </p>
        </ng-template>
      </ngb-tab>
    </ngb-tabset>
  </div>
</div>
<div class="kt-separator kt-separator--dashed"></div>
<div class="kt-section">
  <div class="kt-section__content">
    <div class="btn-group btn-group-toggle" ngbRadioGroup [(ngModel)]="currentOrientation">
      <label ngbButtonLabel class="btn-outline-primary btn-sm">
        <input ngbButton type="radio" value="horizontal">Horizontal
      </label>
      <label ngbButtonLabel class="btn-outline-primary btn-sm">
        <input ngbButton type="radio" value="vertical">Vertical
      </label>
	</div>
  </div>
</div>
		`,
		tsCode: `
import {Component} from '@angular/core';\n
@Component({
    selector: 'ngbd-tabset-orientation',
    templateUrl: './tabset-orientation.html'
)
export class NgbdTabsetOrientation {
    currentOrientation = 'horizontal';
}
`,
		viewCode: ``,
		isCodeVisible: false
	};


const globalConfigurationOfTabs = {
		beforeCodeTitle: 'Global configuration of tabs',
		htmlCode: `
<div class="kt-section">
  <div class="kt-section__content">
    <ngb-tabset>
      <ngb-tab title="One">
        <ng-template ngbTabContent>
          <p>These tabs are displayed as pills...</p>
        </ng-template>
      </ngb-tab>
      <ngb-tab title="Two">
        <ng-template ngbTabContent>
          <p>Because default values have been customized.</p>
        </ng-template>
      </ngb-tab>
    </ngb-tabset>
  </div>
</div>
		`,
		tsCode: `
import {Component} from '@angular/core';
import {NgbTabsetConfig} from '@ng-bootstrap/ng-bootstrap';\n
@Component({
    selector: 'ngbd-tabset-config',
    templateUrl: './tabset-config.html',
    providers: [NgbTabsetConfig] // add NgbTabsetConfig to the component providers
})
export class NgbdTabsetConfig {
    constructor(config: NgbTabsetConfig) {
        // customize default values of tabsets used by this component tree
        config.justify = 'center';
        config.type = 'pills';
	}
}
`,
		viewCode: ``,
		isCodeVisible: false
	};

@Component({
	selector: 'kt-tabs',
	templateUrl: './tabs.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [NgbTabsetConfig] // add NgbTabsetConfig to the component providers
})
export class TabsComponent implements OnInit {
	exampleTabset;
	examplePills;
	exampleSelectAnActiveTabById;
	examplePreventTabChange;
	exampleNavJustification;
	exampleNavOrientation;
	exampleglobalConfigurationOfTabs;

	currentJustify = 'start';
	currentOrientation = 'horizontal';
	globalJustify = 'center';

	constructor(config: NgbTabsetConfig) {
		// customize default values of tabsets used by this component tree
		// config.justify = 'center';
		// config.type = 'pills';
	}

	ngOnInit() {
		this.exampleTabset = tabset;
		this.examplePills = pills;
		this.exampleSelectAnActiveTabById = selectAnActiveTabById;
		this.examplePreventTabChange = preventTabChange;
		this.exampleNavJustification = navJustification;
		this.exampleNavOrientation = navOrientation;
		this.exampleglobalConfigurationOfTabs = globalConfigurationOfTabs;
	}

	public beforeChange($event: NgbTabChangeEvent) {
		if ($event.nextId === 'tab-preventchange2') {
			$event.preventDefault();
		}
	}
}
