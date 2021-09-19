import { Field, Model, FieldMany } from '@Typetron/Models'

export class SearchResult extends Model {
    @Field()
    id: number

    @Field()
    name: string

    @Field()
    avatar?: string
}

export class SearchResults extends Model {
    @FieldMany(SearchResult)
    users: SearchResult[]

    @FieldMany(SearchResult)
    rooms: SearchResult[]
}
