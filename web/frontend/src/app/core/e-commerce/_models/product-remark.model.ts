import { BaseModel } from '../../_base/crud';

export class ProductRemarkModel extends BaseModel {
	id: number;
	carId: number;
	text: string;
	type: number; // Info, Note, Reminder
	dueDate: string;
	_isEditMode: boolean;

	// Refs
	_carName: string;

	clear(carId: number) {
		this.id = undefined;
		this.carId = carId;
		this.text = '';
		this.type = 0;
		this.dueDate = '';
		this._isEditMode = false;
	}
}
