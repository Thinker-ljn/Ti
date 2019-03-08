// import Branch from './branch'
// import { BranchData } from './types';
import { Observable } from 'rxjs';

export interface FruitInterface<O, B> {
  branch: B
  source_: Observable<O>
}

export interface FruitConstructor<O, B> {
  new (branch: B): FruitInterface<O, B>
}

export default abstract class Fruit<O, B> implements FruitInterface<O, B> {
  branch: B
  abstract source_: Observable<O>
  constructor (branch: B) {
    this.branch = branch
  }
}
