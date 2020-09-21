// Context
export { ECommerceDataContext } from './_server/_e-commerce.data-context';

// Models and Consts
export { CustomerModel } from './_models/customer.model';
export { ProductRemarkModel } from './_models/product-remark.model';
export { ProductSpecificationModel } from './_models/product-specification.model';
export { ProductModel } from './_models/product.model';
export { SPECIFICATIONS_DICTIONARY } from './_consts/specification.dictionary';

// DataSources
export { CustomersDataSource } from './_data-sources/customers.datasource';
export { ProductRemarksDataSource } from './_data-sources/product-remarks.datasource';
export { ProductSpecificationsDataSource } from './_data-sources/product-specifications.datasource';
export { ProductsDataSource } from './_data-sources/products.datasource';

// Actions
// Customer Actions =>
export {
    CustomerActionTypes,
    CustomerActions,
    CustomerOnServerCreated,
    CustomerCreated,
    CustomerUpdated,
    CustomersStatusUpdated,
    OneCustomerDeleted,
    ManyCustomersDeleted,
    CustomersPageRequested,
    CustomersPageLoaded,
    CustomersPageCancelled,
    CustomersPageToggleLoading
} from './_actions/customer.actions';
// Product actions =>
export {
    ProductActionTypes,
    ProductActions,
    ProductOnServerCreated,
    ProductCreated,
    ProductUpdated,
    ProductsStatusUpdated,
    OneProductDeleted,
    ManyProductsDeleted,
    ProductsPageRequested,
    ProductsPageLoaded,
    ProductsPageCancelled,
    ProductsPageToggleLoading,
    ProductsActionToggleLoading
} from './_actions/product.actions';
// ProductRemark Actions =>
export {
    ProductRemarkActionTypes,
    ProductRemarkActions,
    ProductRemarkCreated,
    ProductRemarkUpdated,
    ProductRemarkStoreUpdated,
    OneProductRemarkDeleted,
    ManyProductRemarksDeleted,
    ProductRemarksPageRequested,
    ProductRemarksPageLoaded,
    ProductRemarksPageCancelled,
    ProductRemarksPageToggleLoading,
    ProductRemarkOnServerCreated
} from './_actions/product-remark.actions';
// ProductSpecification Actions =>
export {
    ProductSpecificationActionTypes,
    ProductSpecificationActions,
    ProductSpecificationCreated,
    ProductSpecificationUpdated,
    OneProductSpecificationDeleted,
    ManyProductSpecificationsDeleted,
    ProductSpecificationsPageRequested,
    ProductSpecificationsPageLoaded,
    ProductSpecificationsPageCancelled,
    ProductSpecificationsPageToggleLoading,
    ProductSpecificationOnServerCreated
} from './_actions/product-specification.actions';


// Effects
export { CustomerEffects } from './_effects/customer.effects';
export { ProductEffects } from './_effects/product.effects';
export { ProductRemarkEffects } from './_effects/product-remark.effects';
export { ProductSpecificationEffects } from './_effects/product-specification.effects';

// Reducers
export { customersReducer } from './_reducers/customer.reducers';
export { productsReducer } from './_reducers/product.reducers';
export { productRemarksReducer } from './_reducers/product-remark.reducers';
export { productSpecificationsReducer } from './_reducers/product-specification.reducers';

// Selectors
// Customer selectors =>
export {
    selectCustomerById,
    selectCustomersInStore,
    selectCustomersPageLoading,
    selectLastCreatedCustomerId,
    selectCustomersActionLoading,
    selectCustomersShowInitWaitingMessage
} from './_selectors/customer.selectors';
// Product selectors
export {
    selectProductById,
    selectProductsInStore,
    selectProductsPageLoading,
    selectProductsPageLastQuery,
    selectLastCreatedProductId,
    selectHasProductsInStore,
    selectProductsActionLoading,
    selectProductsInitWaitingMessage
} from './_selectors/product.selectors';
// ProductRemark selectors =>
export {
    selectProductRemarkById,
    selectProductRemarksInStore,
    selectProductRemarksPageLoading,
    selectCurrentProductIdInStoreForProductRemarks,
    selectLastCreatedProductRemarkId,
    selectPRShowInitWaitingMessage
} from './_selectors/product-remark.selectors';
// ProductSpecification selectors =>
export {
    selectProductSpecificationById,
    selectProductSpecificationsInStore,
    selectProductSpecificationsPageLoading,
    selectCurrentProductIdInStoreForProductSpecs,
    selectProductSpecificationsState,
    selectLastCreatedProductSpecificationId,
    selectPSShowInitWaitingMessage
} from './_selectors/product-specification.selectors';

// Services
export { CustomersService } from './_services/';
export { ProductsService } from './_services/';
export { ProductRemarksService } from './_services/';
export { ProductSpecificationsService } from './_services/';
