export class PageConfig {
	public defaults: any = {
		dashboard: {
			page: {
				title: 'Dashboard',
				desc: 'CoViD-19 ',
			},
		},
		ngbootstrap: {
			accordion: {
				page: {title: 'Accordion', desc: ''}
			},
			alert: {
				page: {title: 'Alert', desc: ''}
			},
			buttons: {
				page: {title: 'Buttons', desc: ''}
			},
			carousel: {
				page: {title: 'Carousel', desc: ''}
			},
			collapse: {
				page: {title: 'Collapse', desc: ''}
			},
			datepicker: {
				page: {title: 'Datepicker', desc: ''}
			},
			dropdown: {
				page: {title: 'Dropdown', desc: ''}
			},
			modal: {
				page: {title: 'Modal', desc: ''}
			},
			pagination: {
				page: {title: 'Pagination', desc: ''}
			},
			popover: {
				page: {title: 'Popover', desc: ''}
			},
			progressbar: {
				page: {title: 'Progressbar', desc: ''}
			},
			rating: {
				page: {title: 'Rating', desc: ''}
			},
			tabs: {
				page: {title: 'Tabs', desc: ''}
			},
			timepicker: {
				page: {title: 'Timepicker', desc: ''}
			},
			tooltip: {
				page: {title: 'Tooltip', desc: ''}
			},
			typehead: {
				page: {title: 'Typehead', desc: ''}
			}
		},
		material: {
			// form controls
			'form-controls': {
				autocomplete: {
					page: {title: 'Auto Complete', desc: ''}
				},
				checkbox: {
					page: {title: 'Checkbox', desc: ''}
				},
				datepicker: {
					page: {title: 'Datepicker', desc: ''}
				},
				radiobutton: {
					page: {title: 'Radio Button', desc: ''}
				},
				formfield: {
					page: {title: 'Form field', desc: ''}
				},
				input: {
					page: {title: 'Input', desc: ''}
				},
				select: {
					page: {title: 'Select', desc: ''}
				},
				slider: {
					page: {title: 'Slider', desc: ''}
				},
				slidertoggle: {
					page: {title: 'Slider Toggle', desc: ''}
				}
			},
			// navigation
			navigation: {
				menu: {
					page: {title: 'Menu', desc: ''}
				},
				sidenav: {
					page: {title: 'Sidenav', desc: ''}
				},
				toolbar: {
					page: {title: 'Toolbar', desc: ''}
				}
			},
			// layout
			layout: {
				card: {
					page: {title: 'Card', desc: ''}
				},
				divider: {
					page: {title: 'Divider', desc: ''}
				},
				'expansion-panel': {
					page: {title: 'Expansion panel', desc: ''}
				},
				'grid-list': {
					page: {title: 'Grid list', desc: ''}
				},
				list: {
					page: {title: 'List', desc: ''}
				},
				tabs: {
					page: {title: 'Tabs', desc: ''}
				},
				stepper: {
					page: {title: 'Stepper', desc: ''}
				},
				'default-forms': {
					page: {title: 'Default Forms', desc: ''}
				},
				tree: {
					page: {title: 'Tree', desc: ''}
				},
			},
			// buttons & indicators
			'buttons-and-indicators': {
				button: {
					page: {title: 'Button', desc: ''}
				},
				'button-toggle': {
					page: {title: 'Button toggle', desc: ''}
				},
				chips: {
					page: {title: 'Chips', desc: ''}
				},
				icon: {
					page: {title: 'Icon', desc: ''}
				},
				'progress-bar': {
					page: {title: 'Progress bar', desc: ''}
				},
				'progress-spinner': {
					page: {title: 'Progress spinner', desc: ''}
				}
			},
			// popups & models
			'popups-and-modals': {
				'bottom-sheet': {
					page: {title: 'Bottom sheet', desc: ''}
				},
				dialog: {
					page: {title: 'Dialog', desc: ''}
				},
				snackbar: {
					page: {title: 'Snackbar', desc: ''}
				},
				tooltip: {
					page: {title: 'Tooltip', desc: ''}
				}
			},
			// Data tables
			'data-table': {
				paginator: {
					page: {title: 'Paginator', desc: ''}
				},
				'sort-header': {
					page: {title: 'Sort header', desc: ''}
				},
				table: {
					page: {title: 'Table', desc: ''}
				}
			}
		},
		forms: {
			page: {title: 'Forms', desc: ''}
		},
		mail: {
			page: {title: 'Mail', desc: 'Mail'}
		},
		ecommerce: {
			customers: {
				page: {title: 'Customers', desc: ''}
			},
			products: {
				edit: {
					page: {title: 'Edit product', desc: ''}
				},
				add: {
					page: {title: 'Create product', desc: ''}
				}
			},
			orders: {
				page: {title: 'Orders', desc: ''}
			}
		},
		'user-management': {
			users: {
				page: {title: 'Users', desc: ''}
			},
			roles: {
				page: {title: 'Roles', desc: ''}
			}
		},
		builder: {
			page: {title: 'Layout Builder', desc: ''}
		},
		header: {
			actions: {
				page: {title: 'Actions', desc: 'Actions example page'}
			}
		},
		profile: {
			page: {title: 'User Profile', desc: ''}
		},
		error: {
			404: {
				page: {title: '404 Not Found', desc: '', subheader: false}
			},
			403: {
				page: {title: '403 Access Forbidden', desc: '', subheader: false}
			}
		},
		wizard: {
			'wizard-1': {page: {title: 'Wizard 1', desc: ''}},
			'wizard-2': {page: {title: 'Wizard 2', desc: ''}},
			'wizard-3': {page: {title: 'Wizard 3', desc: ''}},
			'wizard-4': {page: {title: 'Wizard 4', desc: ''}},
		},
	};

	public get configs(): any {
		return this.defaults;
	}
}
