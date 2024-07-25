
interface MetaMap {
    [key: string]: string | undefined
}

interface MetaMapCollection {
    [key: string]: MetaMap | undefined
}


export const FRONT_URL: string = "https://smarkey.me"

// possible img -> https://ghost.smarkey.me/content/images/2024/07/chickadee.png

export const DEFAULT_META: MetaMap = {
    "title": "smarkey.me",
    "desc": "Check out my website, where every now and then I'll post about my interests.",
    "img": "https://ghost.smarkey.me/content/images/2024/07/sapling.png"
}

export const META: MetaMapCollection = {
    "": DEFAULT_META,
    "/blog": {
        "title": "Blog | smarkey.me",
        "desc": "The smarkey.me blog, featuring posts when I'm done with setting up the site.",
        "img": DEFAULT_META.img
    },
    "/projects": {
        "title": "Projects | smarkey.me",
        "desc": "A list of some projects I'm working on or have worked on in the past.",
        "img": DEFAULT_META.img
    },
    "/contact": {
        "title": "Contact | smarkey.me",
        "desc": "Some ways to find me online!",
        "img": DEFAULT_META.img
    }
}

