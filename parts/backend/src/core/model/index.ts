import Builder from "../database/query/builder";
import { PromiseConnection } from "../database/connection";
import BelongsToMany from "./relations/belongs.to.many";
import { Data } from "../database/query/grammar/components/where";


export interface IdData extends Data {
  id?: number
}

export interface ModelInstance {
  id?: number
}

export interface ModelConstructor {
  new (): ModelInstance
}

export function defEnumerable (target: any, propertyKeys: string[]) {
  for (let propertyKey of propertyKeys) {
    let descriptor = Object.getOwnPropertyDescriptor(target, propertyKey) || {};
    descriptor.enumerable = false
    Object.defineProperty(target, propertyKey, descriptor)
  }
}
export default class Model<T extends IdData> implements ModelInstance {
  static tableName: string = Model.parseTableName()
  static connection: PromiseConnection

  readonly _modelName: string = Model.name
  readonly _tableName: string = Model.parseTableName()
  readonly _primaryKey: string = 'id'
  protected _properties: T
  
  constructor () {
    defEnumerable(this, ['_modelName', '_tableName', '_primaryKey', '_properties'])
  }
  
  get id () {
    return this._properties.id
  }

  static setConnection (connection: PromiseConnection | (() => PromiseConnection)) {
    if (typeof connection === 'function') {
      Model.connection = connection()
    } else {
      Model.connection = connection
    }
  }

  static newQuery <T extends IdData>() {
    if (!this.connection) throw 'Model Query Need A IdDatabase Connection!'
    if (!this.tableName) this.tableName = this.parseTableName()
    return new Builder<T>(this.tableName, this.connection)
  }

  static parseTableName () {
    return this.name.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase().plural()
  }
  
  static async all () {
    return await this.newQuery().all()
  }

  static async find (id: number) {
    let result = await this.newQuery().find(id)
    if (!result.length) {
      throw 'Cannot find the model'
    }

    let model = new this()

    model._properties = result[0]
    return model
  }
  
  set (properties: T) {
    this._properties = properties
  }

  get () {
    return this._properties
  }

  async save (properties?: T) {
    if (properties) this._properties = properties
    let query = Model.newQuery<T>()
    let result = await query.insert(this._properties)
    this._properties.id = result.insertId

    return result
  }

  
  async update (properties?: T) {
    if (properties) this._properties = properties

    let query = Model.newQuery()
    let pkValue = this._properties[this._primaryKey]
    let result = await query.where(this._primaryKey, pkValue).update(this._properties)

    return result
  }

  
  async delete (properties?: T) {
    if (properties) this._properties = properties
    let pkValue = this._properties[this._primaryKey]
    let query = Model.newQuery()
    let result = await query.where(this._primaryKey, pkValue).delete()

    return result
  }

  belongsToMany (classB: ModelConstructor) {
    return new BelongsToMany<T>(this, classB, Model.connection)
  }
}