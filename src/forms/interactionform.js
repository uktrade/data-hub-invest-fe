const React = require('react')
const axios = require('axios')
const BaseForm = require('@uktrade/trade_elements_react/forms/baseform')
const Autosuggest = require('@uktrade/trade_elements_react/components/autosuggest.component')
const Select = require('@uktrade/trade_elements_react/components/select.component')
const DateInput = require('@uktrade/trade_elements_react/components/dateinput.component')
const InputText = require('@uktrade/trade_elements_react/components/inputtext.component')
const ErrorList = require('@uktrade/trade_elements_react/components/errorlist.component')

const LABELS = {
  'company': 'Company',
  'contact': 'Company contact',
  'dit_advisor': 'DIT advisor',
  'interaction_type': 'Interaction type',
  'subject': 'Subject',
  'notes': 'Interaction notes',
  'data_of_interaction': 'Date of interaction',
  'service': 'Service offer',
  'dit_team': 'Service provider'
}
const defaultInteraction = {
  company: {
    id: '',
    name: ''
  },
  contact: {
    id: '',
    name: ''
  },
  dit_advisor: {
    id: '',
    name: ''
  },
  interaction_type: {
    id: '',
    name: ''
  },
  subject: '',
  notes: '',
  date_of_interaction: '',
  service: {
    id: '',
    name: ''
  },
  dit_team: {
    id: '',
    name: ''
  }
}

class InteractionForm extends BaseForm {

  // Construct the initial state
  // The form can be called wither with an interaction to edit
  // or from the contact and company screens, which will pre populate
  // some information.
  // Depending on where the user came from the form decides if it should let
  // the user enter/edit the company/contact or simply show it.
  // If adding a new record we also set the default advisor to the logged in user
  constructor (props) {
    super(props)

    let state = {
      saving: false,
      showCompanyField: true,
      showContactField: true
    }

    if (props.interaction) {
      // If editing an interaction
      state.formData = props.interaction
      state.showCompanyField = false
      state.showContactField = false
    } else if (props.contact) {
      // if adding an interaction from contact screen
      state.formData = {
        company: props.contact.company,
        contact: props.contact,
        dit_advisor: props.user
      }
      state.showCompanyField = false
      state.showContactField = false
    } else if (props.company) {
      // if adding an interaction from company screen
      state.formData = {
        company: props.company,
        dit_advisor: props.user
      }
      state.showCompanyField = false
    } else {
      state.formData = {
        dit_advisor: props.user
      }
    }

    this.setDefaults(state.formData, defaultInteraction)
    this.state = state
  }

  // Save the interaction to the json api. Note that the CSRF token for
  // JSON calls is global on the web page, this is a pattern used as in some
  // screens json calls are done for things other than saving, such as archiving.
  save = () => {
    this.setState({saving: true})
    axios.post('/api/interaction/',
      { interaction: this.state.formData },
      { headers: { 'x-csrf-token': window.csrfToken } }
      )
      .then((response) => {
        window.csrfToken = response.headers['x-csrf-token']
        // browserHistory.push(`/interaction/${response.data.id}`)
      })
      .catch((error) => {
        if (error.response && error.response.headers) {
          window.csrfToken = error.response.headers['x-csrf-token']
          this.setState({
            errors: error.response.data.errors,
            saving: false
          })
        }
      })
  }

  lookupContacts = (term) => {
    return new Promise((resolve) => {
      axios.get(`/api/contactlookup?company=${this.state.formData.company.id}&contact=${term}`)
        .then(response => {
          resolve(response.data)
        })
    })
  }

  getBackLink () {
    // if called with a company id, go back to company
    if (this.props.company) {
      return (<a className='button-link button--cancel js-button-cancel' href={`/company/company_company/${this.props.company.id}/interactions`}>Cancel</a>)
    } else if (this.props.contact) {
      return (<a className='button-link button--cancel js-button-cancel' href={`/contact/${this.props.contact.id}/interactions`}>Cancel</a>)
    } else if (this.props.interaction) {
      return (<a className='button-link button--cancel js-button-cancel' href={`/interaction/${this.props.interaction.id}`}>Cancel</a>)
    }
    return (<a href='/' className='button-link button--cancel js-button-cancel'>Cancel</a>)
  }

  render () {
    if (this.state.saving) {
      return this.getSaving()
    }
    const formData = this.state.formData
    const backLink = this.props.backLink

    return (
      <div>
        { backLink && <a className='back-link' href={backLink.url}>{backLink.title}</a> }
        { this.props.params.interactionId ? <h1 className='page-heading'>Edit interaction</h1>
          : <h1 className='page-heading'>Add interaction</h1>
        }

        { this.state.errors &&
        <ErrorList labels={LABELS} errors={this.state.errors} />
        }

        { this.state.showCompanyField ? <Autosuggest
          name='company'
          label={LABELS.company}
          value={formData.company}
          lookupUrl='/api/suggest'
          onChange={this.updateField}
          errors={this.getErrors('title')}
          searchingFor='a company'
          /> : <div className='form-group'>
            <div className='form-label-bold'>Company</div>
            <strong>{ formData.company.name }</strong>
          </div>
        }

        <Select
          value={formData.interaction_type.id || null}
          url='/api/meta/typesofinteraction'
          name='interaction_type'
          label={LABELS.interaction_type}
          errors={this.getErrors('interaction_type')}
          onChange={this.updateField}
        />
        <InputText
          label={LABELS.subject}
          name='subject'
          value={formData.subject}
          onChange={this.updateField}
          errors={this.getErrors('subject')}
        />
        <div className='form-group '>
          <label className='form-label-bold' htmlFor='description'>{LABELS.notes}</label>
          <textarea
            id='notes'
            className='form-control'
            name='notes'
            rows='5'
            onChange={this.updateField}
            value={formData.notes} />
        </div>

        { this.state.showContactField ? <Autosuggest
          name='contact'
          label={LABELS.contact}
          value={formData.contact}
          fetchSuggestions={this.lookupContacts}
          onChange={this.updateField}
          errors={this.getErrors('contact')}
          searchingFor='a contact'
          />
          : <div className='form-group'>
            <div className='form-label-bold'>{LABELS.contact}</div>
            <strong>{ formData.contact.first_name } { formData.contact.last_name }</strong>
          </div>
        }

        <DateInput
          label='Date of interaction'
          name='date_of_interaction'
          value={formData.date_of_interaction}
          onChange={this.updateField}
          errors={this.getErrors('date_of_interaction')}
        />
        <Autosuggest
          name='dit_advisor'
          label={LABELS.dit_advisor}
          value={formData.dit_advisor}
          lookupUrl='/api/accountmanagerlookup'
          onChange={this.updateField}
          errors={this.getErrors('dit_advisor')}
          searchingFor='an advisor'
        />
        <Autosuggest
          name='service'
          label={LABELS.service}
          value={formData.service}
          optionsUrl='/api/meta/service'
          onChange={this.updateField}
          errors={this.getErrors('service')}
          searchingFor='a service'
        />
        <Autosuggest
          name='dit_team'
          label={LABELS.dit_team}
          value={formData.dit_team}
          lookupUrl='/api/teamlookup'
          onChange={this.updateField}
          errors={this.getErrors('dit_team')}
          searchingFor='a team'
        />
        <div className='button-bar'>
          <button className='button button--save' type='button' onClick={this.save}>Save</button>
          { this.getBackLink() }
        </div>
      </div>
    )
  }
}

module.exports = InteractionForm
