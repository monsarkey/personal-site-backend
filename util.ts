import { Post, Tag } from "@ts-ghost/content-api";


// selects our desired fields from the response data returned by ghost
export function selectPostFields(post: any) {

    post.tags = post.tags.map(selectTagFields)

    const {slug, id, title, custom_excerpt, feature_image, tags} = post;
    return {slug, id, title, custom_excerpt, feature_image, tags};
}

function selectTagFields(tag: Tag)  {
    const {id, slug, name, description, accent_color} = tag;
    return {id, slug, name, description, accent_color};
}