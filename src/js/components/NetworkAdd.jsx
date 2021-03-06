import React, { useState } from "react";

import useUser from "../hooks/User.jsx"
import { apiInstanceAction } from "../api.js"
import { useKeywords } from "../hooks/Keywords.jsx"
import { SectionForm } from "./SectionForm.jsx"
import { useStateValue } from '../state.js';
import useApiResponse from "../hooks/ApiResponse.jsx"

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';

import AddIcon from '@material-ui/icons/Add';

function NetworkAdd(props) {
	const {path} = props
	const { auth } = useUser()
	const [open, setOpen] = React.useState(false)
	const [data, setData] = useState({})
	const kws = useKeywords("ccfg")
	const [{user}, dispatch] = useStateValue()
	if (!user.grant) {
		return null
	}
	if (!("root" in user.grant)) {
		return null
	}
	if (!kws) {
		return null
	}
        function handleClickOpen(e) {
                e.stopPropagation()
                setOpen(true)
        }
        function handleClose(e) {
                setOpen(false)
        }
	function handleSubmit(e) {
		var kw = []
		for (var k in data) {
			if (k == "sectionName") {
				continue
			}
			if (!data[k]) {
				continue
			}
			var _kw = "network#"+data.sectionName+"."+k+"="+data[k]
			kw.push(_kw)
		}
		console.log("SUBMIT", data.sectionName, data.type, data, "=>", kw)
		apiInstanceAction("ANY", "cluster", "set", {kw: kw}, (data) => dispatchAlerts({data: data}), auth)
		handleClose(e)
	}
	return (
		<React.Fragment>
			<IconButton
				aria-label="Add Network"
				aria-haspopup={true}
				onClick={handleClickOpen}
			>
				<AddIcon />
			</IconButton>
			<Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
				<DialogTitle id="form-dialog-title">Create New Network</DialogTitle>
				<DialogContent>
					<DialogContentText>
						A network hosts dynamically allocated ip addresses for ip.cni resources.
						The <code>bridge</code> types is node-local, the <code>routed_bridge</code>
						and <code>weave</code> types are cluster-wide.
					</DialogContentText>
					<SectionForm kind="Network" kws={kws.network} data={data} setData={setData} />
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose} color="primary">
						Cancel
					</Button>
					<Button onClick={handleSubmit} color="secondary">
						Submit
					</Button>
				</DialogActions>
			</Dialog>
		</React.Fragment>
	)
}

export {
	NetworkAdd,
}
