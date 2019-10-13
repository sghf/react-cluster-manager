import React, {useState, useEffect} from "react";
import { useLog } from "../hooks/Log.jsx"
import { useTranslation } from 'react-i18next'
import { TableToolbar } from "./TableToolbar.jsx";

import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import clsx from 'clsx'
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import Skeleton from '@material-ui/lab/Skeleton';
import FilterListIcon from '@material-ui/icons/FilterList';

const useStyles = makeStyles(theme => ({
	content: {
		paddingTop: 0,
	},
	textField: {
		width: "100%",
	},
	logLine: {
		width: "100%",
		borderLeftWidth: "4px",
		borderLeftStyle: "solid",
		borderLeftColor: theme.palette.text.secondary,
		paddingLeft: theme.spacing(1),
		paddingBottom: theme.spacing(1),
	},
	log: {
		display: "flex",
		flexDirection: "column-reverse",
		wordWrap: "break-word",
		paddingTop: theme.spacing(2),
	},
	ERROR: {
		borderColor: theme.status.danger,
	},
	WARNING: {
		borderColor: theme.status.warning,
	},
}))

function Log(props) {
	const log = useLog(props.url)
	const [searchOpen, setSearchOpen] = useState(false)
	const [search, setSearch] = useState("")
	const [skip, setSkip] = useState()
	const classes = useStyles()
	const {t, i18n} = useTranslation()

	function handleChange(e) {
		setSearch(e.target.value)
		location.href = "#"
		setSkip(null)
	}
	useEffect(() => {
		if (skip && (!location.href.match(RegExp("#"+skip+"$")))) {
			location.href = "#"+skip
		}
	})
	return (
                <Card>
                        <CardHeader
                                title={props.title}
                                subheader={props.subheader}
				action={
                                        <TableToolbar selected={[]} className={classes.table}>
                                                <Tooltip title={t("Filters")}>
                                                        <IconButton aria-label="Filters" disabled={search?true:false} onClick={() => {(!search) && setSearchOpen(!searchOpen)}}>
                                                                <FilterListIcon />
                                                        </IconButton>
                                                </Tooltip>
                                        </TableToolbar>
				}
                        />
                        <CardContent className={classes.content}>
				{(searchOpen || search) &&
				<TextField
					className={classes.textField}
					id="search"
					label={t("Search Regular Expression")}
					type="search"
					margin="normal"
					variant="outlined"
					onChange={handleChange}
					value={search}
				/>
				}
				<LogLines
					log={log}
					search={search}
					setSearch={setSearch}
					setSkip={setSkip}
				/>
			</CardContent>
                </Card>

	)
}

function LogLines(props) {
	const classes = useStyles()
	if (!props.log) {
		return ( <CircularProgress color="primary" /> )
	}
	if (props.search && (props.search.length>1)) {
		var re = RegExp(props.search, "i")
	} else {
		var re
	}
	return (
		<div className={classes.log}>
			{props.log.map((line, i) => (
				<LogLine
					key={i}
					id={i}
					data={line}
					re={re}
					setSearch={props.setSearch}
					setSkip={props.setSkip}
				/>
			))}
		</div>
	)	
}

function LogLine(props) {
	const classes = useStyles()
	if (!props.data) {
		return <Skeleton />
	}
	var l = props.data.split(" - ")
	var level = l[2]
	if (props.re && !props.data.match(props.re)) {
		return null
	}
	function handleClick(e) {
		props.setSearch("")
		props.setSkip(props.id)
	}
	return (
		<div className={clsx(classes.logLine, classes[level])} id={props.id} onClick={handleClick}>
			<Typography variant="caption" color="textSecondary" display="block">
				{l[0]} - {l[1]}
			</Typography>
			{l.slice(3).join(" - ")}
		</div>
	)
}

export {
	Log
}
