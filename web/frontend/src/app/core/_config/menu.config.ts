export class MenuConfig {
	public defaults: any = {
		header: {
			self: {},
			items: [
				{
					title: 'Dashboard',
					root: true,
					alignment: 'left',
					page: '/dashboard',
					translate: 'MENU.DASHBOARD',
				},
				{
					title: 'Diagnóstico',
					root: true,
					alignment: 'left',
					page: '/diagnostico',
					translate: 'MENU.DIAGNOSTICO',
					submenu: [
						{
							title: 'Raio-X',
							root: true,
							alignment: 'left',
							page: '/diagnostico/raiox',
							translate: 'MENU.DIAGNOSTICO_RAIO_X',
						},
						// {
						// 	title: 'Lâmina de Tomografia',
						// 	root: true,
						// 	alignment: 'left',
						// 	page: '/diagnostico/lamina',
						// 	translate: 'MENU.DIAGNOSTICO_LAMINA_TOMOGRAFIA',
						// },
						// {
						// 	title: 'DICOM',
						// 	root: true,
						// 	alignment: 'left',
						// 	page: '/diagnostico/dicom',
						// 	translate: 'MENU.DIAGNOSTICO_DICOM',
						// },
						{
							title: 'nift',
							root: true,
							alignment: 'left',
							page: '/diagnostico/nii',
							translate: 'MENU.DIAGNOSTICO_NII',
						},
					]
				},
				{
					title: 'MENU.SIMULACAO',
					root: true,
					alignment: 'left',
					page: '/simulacao',
					translate: 'MENU.SIMULACAO',
				},
				{
					title: 'MENU.CENARIO',
					root: true,
					alignment: 'left',
					page: '/cenario',
					translate: 'MENU.CENARIO',
				},
				// {
				// 	title: 'Membros',
				// 	root: true,
				// 	alignment: 'left',
				// 	page: '/membros',
				// 	translate: 'MENU.MEMBROS',
				// },
				{
					title: 'Contatos',
					root: true,
					alignment: 'left',
					page: '/contato',
					translate: 'MENU.CONTATO',
				},
				// {
				// 	title: 'Componentes',
				// 	root: true,
				// 	alignment: 'left',
				// 	toggle: 'click',
				// 	translate: 'MENU.COMPONENTES',
				// 	submenu: [
				// 		{
				// 			title: 'Google Material',
				// 			bullet: 'dot',
				// 			icon: 'flaticon-interface-7',
				// 			submenu: [
				// 				{
				// 					title: 'Form Controls',
				// 					bullet: 'dot',
				// 					submenu: [
				// 						{
				// 							title: 'Auto Complete',
				// 							page: '/material/form-controls/autocomplete',
				// 							permission: 'accessToECommerceModule'
				// 						},
				// 						{
				// 							title: 'Checkbox',
				// 							page: '/material/form-controls/checkbox'
				// 						},
				// 						{
				// 							title: 'Radio Button',
				// 							page: '/material/form-controls/radiobutton'
				// 						},
				// 						{
				// 							title: 'Datepicker',
				// 							page: '/material/form-controls/datepicker'
				// 						},
				// 						{
				// 							title: 'Form Field',
				// 							page: '/material/form-controls/formfield'
				// 						},
				// 						{
				// 							title: 'Input',
				// 							page: '/material/form-controls/input'
				// 						},
				// 						{
				// 							title: 'Select',
				// 							page: '/material/form-controls/select'
				// 						},
				// 						{
				// 							title: 'Slider',
				// 							page: '/material/form-controls/slider'
				// 						},
				// 						{
				// 							title: 'Slider Toggle',
				// 							page: '/material/form-controls/slidertoggle'
				// 						}
				// 					]
				// 				},
				// 				{
				// 					title: 'Navigation',
				// 					bullet: 'dot',
				// 					submenu: [
				// 						{
				// 							title: 'Menu',
				// 							page: '/material/navigation/menu'
				// 						},
				// 						{
				// 							title: 'Sidenav',
				// 							page: '/material/navigation/sidenav'
				// 						},
				// 						{
				// 							title: 'Toolbar',
				// 							page: '/material/navigation/toolbar'
				// 						}
				// 					]
				// 				},
				// 				{
				// 					title: 'Layout',
				// 					bullet: 'dot',
				// 					submenu: [
				// 						{
				// 							title: 'Card',
				// 							page: '/material/layout/card'
				// 						},
				// 						{
				// 							title: 'Divider',
				// 							page: '/material/layout/divider'
				// 						},
				// 						{
				// 							title: 'Expansion panel',
				// 							page: '/material/layout/expansion-panel'
				// 						},
				// 						{
				// 							title: 'Grid list',
				// 							page: '/material/layout/grid-list'
				// 						},
				// 						{
				// 							title: 'List',
				// 							page: '/material/layout/list'
				// 						},
				// 						{
				// 							title: 'Tabs',
				// 							page: '/material/layout/tabs'
				// 						},
				// 						{
				// 							title: 'Stepper',
				// 							page: '/material/layout/stepper'
				// 						},
				// 						{
				// 							title: 'Default Forms',
				// 							page: '/material/layout/default-forms'
				// 						},
				// 						{
				// 							title: 'Tree',
				// 							page: '/material/layout/tree'
				// 						}
				// 					]
				// 				},
				// 				{
				// 					title: 'Buttons & Indicators',
				// 					bullet: 'dot',
				// 					submenu: [
				// 						{
				// 							title: 'Button',
				// 							page: '/material/buttons-and-indicators/button'
				// 						},
				// 						{
				// 							title: 'Button toggle',
				// 							page: '/material/buttons-and-indicators/button-toggle'
				// 						},
				// 						{
				// 							title: 'Chips',
				// 							page: '/material/buttons-and-indicators/chips'
				// 						},
				// 						{
				// 							title: 'Icon',
				// 							page: '/material/buttons-and-indicators/icon'
				// 						},
				// 						{
				// 							title: 'Progress bar',
				// 							page: '/material/buttons-and-indicators/progress-bar'
				// 						},
				// 						{
				// 							title: 'Progress spinner',
				// 							page: '/material/buttons-and-indicators/progress-spinner'
				// 						},
				// 						{
				// 							title: 'Ripples',
				// 							page: '/material/buttons-and-indicators/ripples'
				// 						}
				// 					]
				// 				},
				// 				{
				// 					title: 'Popups & Modals',
				// 					bullet: 'dot',
				// 					submenu: [
				// 						{
				// 							title: 'Bottom sheet',
				// 							page: '/material/popups-and-modals/bottom-sheet'
				// 						},
				// 						{
				// 							title: 'Dialog',
				// 							page: '/material/popups-and-modals/dialog'
				// 						},
				// 						{
				// 							title: 'Snackbar',
				// 							page: '/material/popups-and-modals/snackbar'
				// 						},
				// 						{
				// 							title: 'Tooltip',
				// 							page: '/material/popups-and-modals/tooltip'
				// 						}
				// 					]
				// 				},
				// 				{
				// 					title: 'Data table',
				// 					bullet: 'dot',
				// 					submenu: [
				// 						{
				// 							title: 'Paginator',
				// 							page: '/material/data-table/paginator'
				// 						},
				// 						{
				// 							title: 'Sort header',
				// 							page: '/material/data-table/sort-header'
				// 						},
				// 						{
				// 							title: 'Table',
				// 							page: '/material/data-table/table'
				// 						}
				// 					]
				// 				}
				// 			]
				// 		},
				// 		{
				// 			title: 'Ng-Bootstrap',
				// 			bullet: 'dot',
				// 			icon: 'flaticon-web',
				// 			submenu: [
				// 				{
				// 					title: 'Accordion',
				// 					page: '/ngbootstrap/accordion'
				// 				},
				// 				{
				// 					title: 'Alert',
				// 					page: '/ngbootstrap/alert'
				// 				},
				// 				{
				// 					title: 'Buttons',
				// 					page: '/ngbootstrap/buttons'
				// 				},
				// 				{
				// 					title: 'Carousel',
				// 					page: '/ngbootstrap/carousel'
				// 				},
				// 				{
				// 					title: 'Collapse',
				// 					page: '/ngbootstrap/collapse'
				// 				},
				// 				{
				// 					title: 'Datepicker',
				// 					page: '/ngbootstrap/datepicker'
				// 				},
				// 				{
				// 					title: 'Dropdown',
				// 					page: '/ngbootstrap/dropdown'
				// 				},
				// 				{
				// 					title: 'Modal',
				// 					page: '/ngbootstrap/modal'
				// 				},
				// 				{
				// 					title: 'Pagination',
				// 					page: '/ngbootstrap/pagination'
				// 				},
				// 				{
				// 					title: 'Popover',
				// 					page: '/ngbootstrap/popover'
				// 				},
				// 				{
				// 					title: 'Progressbar',
				// 					page: '/ngbootstrap/progressbar'
				// 				},
				// 				{
				// 					title: 'Rating',
				// 					page: '/ngbootstrap/rating'
				// 				},
				// 				{
				// 					title: 'Tabs',
				// 					page: '/ngbootstrap/tabs'
				// 				},
				// 				{
				// 					title: 'Timepicker',
				// 					page: '/ngbootstrap/timepicker'
				// 				},
				// 				{
				// 					title: 'Tooltips',
				// 					page: '/ngbootstrap/tooltip'
				// 				},
				// 				{
				// 					title: 'Typehead',
				// 					page: '/ngbootstrap/typehead'
				// 				}
				// 			]
				// 		},
				// 	]
				// },
				// {
				// 	title: 'Dados Técnicos',
				// 	root: true,
				// 	alignment: 'left',
				// 	toggle: 'click',
				// 	translate: 'MENU.DADOSTECNICOS',
				// 	submenu: [
				// 		{
				// 			title: 'eCommerce',
				// 			bullet: 'dot',
				// 			icon: 'flaticon-business',
				// 			permission: 'accessToECommerceModule',
				// 			submenu: [
				// 				{
				// 					title: 'Customers',
				// 					page: '/ecommerce/customers'
				// 				},
				// 				{
				// 					title: 'Products',
				// 					page: '/ecommerce/products'
				// 				},
				// 			]
				// 		},
				// 		{
				// 			title: 'User Management',
				// 			bullet: 'dot',
				// 			icon: 'flaticon-user',
				// 			submenu: [
				// 				{
				// 					title: 'Users',
				// 					page: '/user-management/users'
				// 				},
				// 				{
				// 					title: 'Roles',
				// 					page: '/user-management/roles'
				// 				}
				// 			]
				// 		},
				// 	]
				// },
				// {
				// 	title: 'Custom',
				// 	root: true,
				// 	alignment: 'left',
				// 	toggle: 'click',
				// 	submenu: [
				// 		{
				// 			title: 'Error Pages',
				// 			bullet: 'dot',
				// 			icon: 'flaticon2-list-2',
				// 			submenu: [
				// 				{
				// 					title: 'Error 1',
				// 					page: '/error/error-v1'
				// 				},
				// 				{
				// 					title: 'Error 2',
				// 					page: '/error/error-v2'
				// 				},
				// 				{
				// 					title: 'Error 3',
				// 					page: '/error/error-v3'
				// 				},
				// 				{
				// 					title: 'Error 4',
				// 					page: '/error/error-v4'
				// 				},
				// 				{
				// 					title: 'Error 5',
				// 					page: '/error/error-v5'
				// 				},
				// 				{
				// 					title: 'Error 6',
				// 					page: '/error/error-v6'
				// 				},
				// 			]
				// 		},
				// 		{
				// 			title: 'Wizard',
				// 			bullet: 'dot',
				// 			icon: 'flaticon2-mail-1',
				// 			submenu: [
				// 				{
				// 					title: 'Wizard 1',
				// 					page: '/wizard/wizard-1'
				// 				},
				// 				{
				// 					title: 'Wizard 2',
				// 					page: '/wizard/wizard-2'
				// 				},
				// 				{
				// 					title: 'Wizard 3',
				// 					page: '/wizard/wizard-3'
				// 				},
				// 				{
				// 					title: 'Wizard 4',
				// 					page: '/wizard/wizard-4'
				// 				},
				// 			]
				// 		},
				// 	]
				// },
			]
		},
	};

	public get configs(): any {
		return this.defaults;
	}
}
