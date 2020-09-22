export class PermissionsTable {
	public static permissions: any = [
        {
            id: 1,
            name: 'accessToECommerceModule',
            level: 1,
            title: 'eCommerce module'
        },
        {
            id: 2,
            name: 'accessToAuthModule',
            level: 1,
            title: 'Users Management module'
        },
        {
            id: 3,
            name: 'accessToMailModule',
            level: 1,
            title: 'Mail module'
        },
        {
            id: 4,
            name: 'canReadECommerceData',
            level: 2,
            parentId: 1,
            title: 'Read'
        },
        {
            id: 5,
            name: 'canEditECommerceData',
            level: 2,
            parentId: 1,
            title: 'Edit'
        },
        {
            id: 6,
            name: 'canDeleteECommerceData',
            level: 2,
            parentId: 1,
            title: 'Delete'
        },
        {
            id: 7,
            name: 'canReadAuthData',
            level: 2,
            parentId: 2,
            title: 'Read'
        },
        {
            id: 8,
            name: 'canEditAuthData',
            level: 2,
            parentId: 2,
            title: 'Edit'
        },
        {
            id: 9,
            name: 'canDeleteAuthData',
            level: 2,
            parentId: 2,
            title: 'Delete'
        },
        {
            id: 10,
            name: 'canReadMailData',
            level: 2,
            parentId: 3,
            title: 'Read'
        },
        {
            id: 11,
            name: 'canEditMailData',
            level: 2,
            parentId: 3,
            title: 'Edit'
        },
        {
            id: 12,
            name: 'canDeleteMailData',
            level: 2,
            parentId: 3,
            title: 'Delete'
        },
    ];
}
