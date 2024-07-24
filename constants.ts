
interface MetaMap {
    [key: string]: string | undefined
}

interface MetaMapCollection {
    [key: string]: MetaMap | undefined
}


export const FRONT_URL: string = "https://smarkey.me"

export const DEFAULT_META: MetaMap = {
    "title": "default title",
    "desc": "default description",
    "img": "https://smarkey.me/static/media/chickadee.a75e6bc557c0eb8ae86d7be125741012.svg"
}

export const META: MetaMapCollection = {
    "": DEFAULT_META,
    "/blog": {
        "title": "blog title",
        "desc": "blog description",
        "img": DEFAULT_META.img
    },
    "/projects": {
        "title": "project title",
        "desc": "blog description",
        "img": DEFAULT_META.img
    },
    "/contact": {
        "title": "contact title",
        "desc": "contact description",
        "img": DEFAULT_META.img
    }
}

