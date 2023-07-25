import { gql } from "graphql-request";

export const loginMutation = gql`
    mutation Login($user: String!, $pass: String!) {
        login(username: $user, pass: $pass, deviceName: "vscode-timey-wimey", type: LongExpiry, cookie: false) {
            token,
            user {
                id,
                name,
            },
            device {
                id,
                name,
                type,
            },
        }
    }
`;

export const getAllTagsQuery = gql`
    query {
        tags {
            key,
        }
    }
`;

export const createTagMutation = gql`
    mutation CreateTagMutation($key: String!) {
        createTag(key: $key, color: "white") {
            key,
        }
    }
`;

export const createTimeSpan = gql`
    mutation CreateTimeSpan($start: Time!, $end: Time, $tags: [InputTimeSpanTag!]) {
        createTimeSpan(start: $start, end: $end, tags: $tags, note: "From timey-wimey (vscode)") {
            id,
        }
    }
`;