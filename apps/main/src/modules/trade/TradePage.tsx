import { Grid, Paper, Separator } from "@galacticcouncil/ui/components"

export const SwapPage = () => {
  return (
    <div>
      <Grid columns={12} gap={20}>
        <Paper p={20} sx={{ gridColumn: "span 7 / span 7" }}>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Facilis hic
          ut assumenda quidem recusandae? Ad accusantium iure, labore explicabo
          aspernatur eveniet. Eligendi perferendis dolore nobis tempora
          reprehenderit rerum quae modi?
          <Separator my={20} mx={-20} />
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Facilis hic
          ut assumenda quidem recusandae? Ad accusantium iure, labore explicabo
          aspernatur eveniet. Eligendi perferendis dolore nobis tempora
          reprehenderit rerum quae modi?
        </Paper>
        <Paper p={20} sx={{ gridColumn: "span 5 / span 5" }}>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Facilis hic
          ut assumenda quidem recusandae? Ad accusantium iure, labore explicabo
          aspernatur eveniet. Eligendi perferendis dolore nobis tempora
          reprehenderit rerum quae modi?
          <Separator my={20} mx={-20} />
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Facilis hic
          ut assumenda quidem recusandae? Ad accusantium iure, labore explicabo
          aspernatur eveniet. Eligendi perferendis dolore nobis tempora
          reprehenderit rerum quae modi?
        </Paper>
        <Paper p={20} sx={{ gridColumn: "span 12 / span 12" }}>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Facilis hic
          ut assumenda quidem recusandae? Ad accusantium iure, labore explicabo
          aspernatur eveniet. Eligendi perferendis dolore nobis tempora
          reprehenderit rerum quae modi?
          <Separator my={20} mx={-20} />
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Facilis hic
          ut assumenda quidem recusandae? Ad accusantium iure, labore explicabo
          aspernatur eveniet. Eligendi perferendis dolore nobis tempora
          reprehenderit rerum quae modi?
        </Paper>
      </Grid>
    </div>
  )
}
