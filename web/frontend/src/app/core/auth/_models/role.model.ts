import { BaseModel } from '../../_base/crud';

export class Role extends BaseModel {
    id: number;
    title: string;
    permissions: number[];
    isCoreRole = false;

    clear(): void {
        this.id = undefined;
        this.title = '';
        this.permissions = [];
        this.isCoreRole = false;
	}
}
