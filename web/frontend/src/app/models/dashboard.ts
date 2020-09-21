import { Dado } from './dado';

export interface Dashboard {
    previsto: Array<Dado>;
    real: Array<Dado>;
}
