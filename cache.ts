
import { TSGhostContentAPI } from '@ts-ghost/content-api';
import { Post } from './types'
import { selectPostFields } from './util';


export class PostCache {

  private _postList: Post[];
  private _cache: {};
  private _api: TSGhostContentAPI;

  private _retry_num: number;
  private _setup_failure: boolean = false;

  constructor(api: TSGhostContentAPI, retry_num: number = 5) {

    this._api = api;
    this._retry_num = retry_num;

    this._postList = this._getPosts() || [];

  }

  private _getPosts(): Post[] | null {

    let attempt = 0;

    do {
      this._api.posts
        .browse()
        .include({ tags: true })
        .fetch()
        .then((result) => {
          if (result.success) {
            return result.data.map(selectPostFields);
          } else {
            console.log(`failed to fetch posts, retrying. [${attempt}/${this._retry_num}] `)
          }
        })
        .catch((error) => {
          console.error(error);
        })   
      attempt += 1;
    } while (attempt < this._retry_num)

    console.log('failed to setup cache!');
    this._setup_failure = true;
    return;

  }

  private _search() {
    
  }

  public refresh() {
    this._cache = {};
    this._postList = this._getPosts() || [];
  }

  public get(request) {

  }

  public set(request) {

  }
}