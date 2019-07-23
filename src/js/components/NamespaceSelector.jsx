import React, { useState } from "react";
import { useStateValue } from '../state.js';
import { namespaceValid, splitPath } from '../utils.js';

import Autosuggest from 'react-autosuggest';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import MenuItem from '@material-ui/core/MenuItem';
import Popper from '@material-ui/core/Popper';
import FormHelperText from '@material-ui/core/FormHelperText';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
	root: {
		flexGrow: 1,
	},
	container: {
		position: 'relative',
	},
	suggestionsContainerOpen: {
		position: 'absolute',
		zIndex: 1,
		marginTop: theme.spacing(1),
		left: 0,
		right: 0,
	},
	suggestion: {
		display: 'block',
	},
	suggestionsList: {
		margin: 0,
		padding: 0,
		listStyleType: 'none',
	},
}))

function getRoleNamespaces(user, role) {
	if (user.grant === undefined) {
		return []
	}
	if (!(role in user.grant)) {
		return []
	}
	var namespaces = [].concat(user.grant[role])
	namespaces.sort()
	return namespaces
}

function getAllNamespaces(cstat) {
	var namespaces = []
	for (var path in cstat.monitor.services) {
		var sp = splitPath(path)
		if (namespaces.indexOf(sp.namespace) >= 0) {
			continue
		}
		namespaces.push(sp.namespace)
	}
	namespaces.sort()
	return namespaces
}

function isSquatter(user) {
	return "squatter" in user.grant
}

function renderInputComponent(props) {
	const { classes, inputRef = () => {}, ref, ...other } = props
	var error = false
	var helperText = null
	if (!namespaceValid(other.value)) {
		error = true
		helperText = "Must start with an aplha and continue with aplhanum, dot, underscore or hyphen."
	} else if (other.namespaces.indexOf(other.value) < 0) {
		if (other.allowNew) {
			helperText = "New namespace"
		} else {
			error = true
			helperText = "You need the squatter role to create this new namespace"
		}
	}

	return (
		<React.Fragment>
			<TextField
				fullWidth
				error={error}
				InputProps={{
					inputRef: node => {
						ref(node);
						inputRef(node);
					},
					classes: {
						input: classes.input,
					},
				}}
				helperText={helperText}
				{...other}
			/>
		</React.Fragment>
	)
}

function renderSuggestion(suggestion, { query, isHighlighted }) {
	const matches = match(suggestion, query)
	const parts = parse(suggestion, matches)

	console.log("renderSuggestion", matches, parts)
	return (
		<MenuItem selected={isHighlighted} component="div">
			<div>
				{parts.map(part => (
					<span key={part.text} style={{ fontWeight: part.highlight ? 500 : 400 }}>
						{part.text}
					</span>
				))}
			</div>
		</MenuItem>
	)
}

function getSuggestions(value, suggestions) {
	const inputValue = value.trim().toLowerCase()
	const inputLength = inputValue.length
	let count = 0

	return inputLength === 0
	? []
	: suggestions.filter(suggestion => {
		const keep = count < 5 && suggestion.slice(0, inputLength).toLowerCase() === inputValue;
		if (keep) {
			count += 1;
		}
		return keep;
	})
}

function getSuggestionValue(suggestion) {
	return suggestion
}

function NamespaceSelector(props) {
	const [{ cstat, user }, dispatch] = useStateValue()
	var namespaces = []
	if (props.role) {
		namespaces = getRoleNamespaces(user, props.role)
	} else {
		namespaces = getNamespaces(cstat)
	}
	const classes = useStyles()
	const [anchorEl, setAnchorEl] = useState(null)
	const [stateSuggestions, setSuggestions] = useState([])

	const handleSuggestionsFetchRequested = ({ value }) => {
		setSuggestions(getSuggestions(value, namespaces))
	}

	const handleSuggestionsClearRequested = () => {
		setSuggestions([])
	}

	const handleChange = (event, { newValue }) => {
		props.onChange(newValue)
	}

	const autosuggestProps = {
		highlightFirstSuggestion: true,
		renderInputComponent,
		suggestions: stateSuggestions,
		onSuggestionsFetchRequested: handleSuggestionsFetchRequested,
		onSuggestionsClearRequested: handleSuggestionsClearRequested,
		getSuggestionValue,
		renderSuggestion,
	};

	console.log(props.selected)
	return (
		<div className={classes.root}>
			<Autosuggest
				{...autosuggestProps}
				inputProps={{
					classes,
					id: props.id,
					label: 'Namespace',
					value: props.selected === undefined ? "" : props.selected,
					onChange: handleChange,
					inputRef: node => {
						setAnchorEl(node);
					},
					InputLabelProps: {
						shrink: true,
					},
					namespaces: namespaces,
					allowNew: isSquatter(user),
				}}
				theme={{
					suggestionsList: classes.suggestionsList,
					suggestion: classes.suggestion,
				}}
				renderSuggestionsContainer={options => (
					<Popper anchorEl={anchorEl} open={Boolean(options.children)}>
						<Paper
							square
							{...options.containerProps}
							style={{ width: anchorEl ? anchorEl.clientWidth : undefined }}
						>
							{options.children}
						</Paper>
					</Popper>
				)}
			/>
		</div>
	);
}

/*
function NamespaceSelector(props) {
	const [{ cstat, user }, dispatch] = useStateValue()
	var namespaces = []
	if (props.role) {
		namespaces = getRoleNamespaces(user, props.role)
	} else {
		namespaces = getNamespaces(cstat)
	}

	return (
		<Typeahead
			id={props.id}
			placeholder={props.placeholder}
			selected={props.selected}
			options={namespaces}
			onChange={props.onChange}
			className="flex-grow-1"
			allowNew={isSquatter(user)}
			newSelectionPrefix="Add a new namespace: "
			invalid={!namespaceValid(props.selected)}
			valid={namespaceValid(props.selected)}
			highlightOnlyResult={true}
			selectHintOnEnter={true}
		/>
	)
}
*/

export {
	NamespaceSelector
}
