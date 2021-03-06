import React from "react";
import PlaceIcon from '@material-ui/icons/Place';
import Typography from '@material-ui/core/Typography';
import { useColorStyles } from "../styles.js"

function ObjPlacement(props) {
	const classes = useColorStyles()
	if (props.placement == "optimal") {
		return null
	} else if (props.placement == "n/a") {
		return null
	} else if (!props.placement) {
		return null
	}
	return (
		<Typography component="span" className={props.className}>
			<PlaceIcon className={classes.warning} title={"Placement "+props.placement} />
		</Typography>
	)
}

export {
	ObjPlacement
}
