

export const TODOS = [
    {
      "name": "Creator",
      "data": {
              "item": "Create/Edit/Delete Post(Text/Image/Video)",
              "detail": [
                  "allow text even if posting Image/Video",
                  "allow pinning location",
                  "details of food",
                  "health data",
                  "Ranking of best food of same type",
                  "Overall ranking"
              ]}
    },
    {
      "name": "Follower",
      "data": {
              "item": "Trending Post/Nearby Post",
              "detail": [
                  "allow comment",
                  "allow like",
                  "allow rank voting"
              ]}
    
    }
  ]

  
export interface TodoDetailData {
    item: string,
    detail: string[]
}
  
export interface TodoData {
  name: string,
  data: TodoDetailData
}
