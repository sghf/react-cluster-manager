import React from "react";
import { useStateValue } from '../state.js';
import { state, fancySizeMB } from "../utils.js";
import { useColorStyles } from "../styles.js";
import { apiNodeAction } from "../api.js";
import { nodeMemOverloadIssue, nodeSwapOverloadIssue, compatIssue, versionIssue } from "../issues.js";
import { ObjFrozen } from "./ObjFrozen.jsx";
import { MonitorStatusBadge } from "./MonitorStatusBadge.jsx";
import { MonitorTargetBadge } from "./MonitorTargetBadge.jsx";
import { NodeActions } from "./NodeActions.jsx";
import { ClusterActions } from "./ClusterActions.jsx";
import { Sparklines, SparklinesLine, SparklinesReferenceLine, SparklinesNormalBand } from 'react-sparklines';

import clsx from 'clsx';
import PropTypes from 'prop-types';
import { lighten, makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Hidden from '@material-ui/core/Hidden';


import DeleteIcon from '@material-ui/icons/Delete';
import FilterListIcon from '@material-ui/icons/FilterList';

const useStyles = makeStyles(theme => ({
        root: {
                padding: theme.spacing(3, 2),
                marginTop: theme.spacing(3),
		overflowX: 'auto',
        },
}))

function NodeCpuSparkline(props) {
	var sampleData = [3, 2, 2, 1, 3, 5, 2]
	return (
		<Sparklines data={sampleData} height={40} style={{ "maxWidth": "6em" }} >
			<SparklinesLine style={{ strokeWidth: 5, stroke: "#6c757d", fill: "none" }} />
			<SparklinesReferenceLine type="mean" style={{ strokeWidth: 2, stroke: "#dc3545" }} />
		</Sparklines>
	)
}

function NodeState(props) {
	var items = [
		<ObjFrozen frozen={props.data.frozen} />,
		<NodeSpeakerBadge speaker={props.data.speaker} />,
		<MonitorStatusBadge state={props.data.monitor.status} />,
		<MonitorTargetBadge target={props.data.monitor.global_expect} />
	]
	return (
		<Grid container spacing={1}>
			{items.map((item, i) => {
				if (!item) {
					return null
				}
				return (
					<Grid item key={i}>
						{item}
					</Grid>
				)
			})}
		</Grid>
	)
}

function NodeSpeakerBadge(props) {
	if (props.speaker != true) {
		return null
	}
	return (
		<Typography color="textSecondary" component="span">
			Speaker
		</Typography>
	)
}

function NodeMetric(props) {
	const [{ cstat }, dispatch] = useStateValue();
	if (props.issue == state.WARNING) {
		var cl = "error"
	} else {
		var cl = "inherit"
	}
	var refer
	if (props.refer) {
		refer = (
			<React.Fragment>
				&nbsp;
				<Typography component="span" variant="caption" color="textSecondary">
					{props.refer}
				</Typography>
			</React.Fragment>
		)
	}
	return (
		<React.Fragment>
			<Typography component="span" color={cl}>
				{props.value}{props.unit}
			</Typography>
			{refer}
		</React.Fragment>
	)
}
function NodeScore(props) {
	const [{ cstat }, dispatch] = useStateValue();
	return (
		<NodeMetric
			label="Score"
			value={cstat.monitor.nodes[props.node].stats.score}
			unit=""
		/>
	)
}function NodeLoad(props) {
	const [{ cstat }, dispatch] = useStateValue();
	return (
		<NodeMetric
			label="Load15m"
			value={cstat.monitor.nodes[props.node].stats.load_15m}
			unit=""
		/>
	)
}
function NodeMem(props) {
	const [{ cstat }, dispatch] = useStateValue();
	var memIssue = nodeMemOverloadIssue(cstat, props.node)
	return (
		<NodeMetric
			label="Avail Mem"
			value={cstat.monitor.nodes[props.node].stats.mem_avail}
			unit="%"
			issue={memIssue}
			refer={fancySizeMB(cstat.monitor.nodes[props.node].stats.mem_total)}
		/>
	)
}
function NodeSwap(props) {
	const [{ cstat }, dispatch] = useStateValue();
	var swapIssue = nodeSwapOverloadIssue(cstat, props.node)
	return (
		<NodeMetric
			label="Avail Swap"
			value={cstat.monitor.nodes[props.node].stats.mem_avail}
			unit="%"
			issue={swapIssue}
			refer={fancySizeMB(cstat.monitor.nodes[props.node].stats.swap_total)}
		/>
	)
}

function Node(props) {
	const [{ cstat }, dispatch] = useStateValue();
	if (cstat.monitor === undefined) {
		return null
	}
	var data = cstat.monitor.nodes[props.node]
	if (data == undefined) {
		return null
	}
	function handleClick(e) {
		dispatch({
			"type": "setNav",
			"page": props.node,
			"links": ["Nodes", props.node]
		})
	}
	return (
		<TableRow onClick={handleClick}>
			<TableCell>{props.node}</TableCell>
			<TableCell><NodeState data={data} /></TableCell>
			<Hidden smDown>
				<TableCell><NodeScore node={props.node} /></TableCell>
				<TableCell><NodeLoad node={props.node} /></TableCell>
				<TableCell><NodeMem node={props.node} /></TableCell>
				<TableCell><NodeSwap node={props.node} /></TableCell>
			</Hidden>
			<TableCell><NodeVersion data={data} compatIssue={props.compatIssue} versionIssue={props.versionIssue} /></TableCell>
			<TableCell><NodeActions node={props.node} /></TableCell>
		</TableRow>
	)
}

function NodeVersion(props) {
	const classes = useColorStyles()
	return (
		<React.Fragment>
			<Typography component="span" className={classes[props.compatIssue.name]}>
				{props.data.compat}
			</Typography>
			&nbsp;
			<Typography component="span" className={classes[props.versionIssue.name]} variant="caption">
				{props.data.agent}
			</Typography>
		</React.Fragment>
	)
}

function Nodes(props) {
	const classes = useStyles()
	const [{ cstat }, dispatch] = useStateValue();
	if (cstat.monitor === undefined) {
		return null
	}
	var vissue = versionIssue(cstat)
	var cissue = compatIssue(cstat)
	function handleTitleClick(e) {
		dispatch({
			"type": "setNav",
			"page": "Nodes",
			"links": ["Nodes"],
		})
	}
	return (
		<Paper id="nodes" className={classes.root}>
			<Typography variant="h4" component="h3">
				<Link href="#" onClick={handleTitleClick}>Nodes</Link>
			</Typography>
			<ClusterActions title="Cluster Actions" />
			<Table>
				<TableHead>
					<TableRow>
						<TableCell>Name</TableCell>
						<TableCell>State</TableCell>
						<Hidden smDown>
							<TableCell>Score</TableCell>
							<TableCell>Load15m</TableCell>
							<TableCell>Mem Avail</TableCell>
							<TableCell>Swap Avail</TableCell>
						</Hidden>
						<TableCell>Version</TableCell>
						<TableCell></TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{cstat.cluster.nodes.map((node) => (
						<Node key={node} node={node} compatIssue={cissue} versionIssue={vissue} />
					))}
				</TableBody>
			</Table>
		</Paper>
	)
}

export {
	Nodes
}
