The "Admin Portal" is a web-based interface designed for administrators to manage and oversee various aspects of the Cosmo Tech platform. It provides an intuitive and user-friendly environment for configuring the objects used by the Cosmo Tech platform:
- organizations
- solutions
- workspaces
- runners
- runs

Mock-ups
You can find the mock-ups for the Admin Portal [here](https://www.figma.com/proto/Wna4gI78OCyHc0rO2V1qNq/Admin-Portal)
They are downloaded locally in the repository under docs/mock-ups/

Organizations

Simulation Digital Twin Organizations are logical groups of platform resources securely isolated from one another within the same cloud tenant and subscription [1]. An Organization defines a company or legal entity and can contain resources for multiple Solutions [2], [1]. It serves as the core of multi-tenant security and manages the hierarchy of workspaces and solutions [3], [2]. User permissions are managed at this level using access-control lists (ACL) with roles such as Viewer, User, Editor, and Admin [4].

• Solutions

A Simulation Digital Twin Solution is software supporting decision-making that provides projections of strategy outcomes using a digital representation of the system and its dynamics [5]. From a developer's perspective, a solution combines the source code of a simulator with at least one run template [6]. It defines the parameters available for a scenario, how to validate a model, and how to execute the engine [7]. Solutions are configured using JSON or YAML files to declare elements such as run templates and parameter groups [8].

• Workspaces
A Workspace defines an analysis or project space that is bound to a Solution [9], [10]. It contextualises business use cases with a web application, dashboard definitions, and available run templates [10]. Workspaces contain Scenarios and require dedicated Azure resources, such as Azure Digital Twins, Event Hubs, or Azure Data Explorer, to function properly [9], [11]. Access permissions are enforced at the workspace level, requiring users to be added to the security list to read workspace resources [12].

• Runners
A Runner is a component hierarchically situated under a workspace that allows the execution of run templates, such as ETL scripts [13]. To create a valid runner, one must reference a valid dataset, a run template defined in the Solution object, and define security access [14]. Access to runners requires specific permissions, needing at least viewer rights on the organization and user rights on the workspace containing the runner [15].

• Runs
A Run (or Scenario Run) is the execution of a scenario [16]. It combines a Dataset with a Run type within the context of a Simulator to perform the necessary computations [17]. The run produces simulation results, which are projections of the system's state over a defined period used to compute KPIs [18]. A run can have a status of Successful, Running, Pending (scheduled but blocked by resource unavailability), or Failed [19].