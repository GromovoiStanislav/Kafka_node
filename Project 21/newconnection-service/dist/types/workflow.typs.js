export class NewConnection {
    workflow;
    get history() {
        return this.workflow.history;
    }
    get financeApproval() {
        return this.workflow.financeApproval;
    }
    set financeApproval(value) {
        this.workflow.financeApproval = value;
    }
    get activationStatus() {
        return this.workflow.activationStatus;
    }
    set activationStatus(value) {
        this.workflow.activationStatus = value;
    }
    constructor(workflow) {
        this.workflow = workflow;
    }
    historyStatus() {
        return Object.values(this.history).every((value) => value === 'success');
    }
}
