import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Loading, Owner, IssuesList } from './styles';
import api from '../../services/api';
import Container from '../../components/Container';

function Repository({ match }) {
    const repoName = decodeURIComponent(match.params.repository);

    const [repository, setRepository] = useState({});
    const [loading, setLoading] = useState(true);
    const [issues, setIssues] = useState([]);

    useEffect(() => {
        async function getInfo() {
            const [info, openIssues] = await Promise.all([
                api.get(`/repos/${repoName}`),
                api.get(`/repos/${repoName}/issues`, {
                    params: {
                        state: 'open',
                        per_page: 5,
                    },
                }),
            ]);

            setRepository(info.data);
            setIssues(openIssues.data);
            setLoading(false);
        }

        getInfo();
    }, [repoName]);

    if (loading) {
        return <Loading>Carregando</Loading>;
    }

    return (
        <Container>
            <Owner>
                <Link to="/">Voltar aos repositórios</Link>
                <img
                    src={repository.owner.avatar_url}
                    alt={repository.owner.login}
                />
                <h1>{repository.name}</h1>
                <p>{repository.description}</p>
            </Owner>

            <IssuesList>
                {issues.map(issue => (
                    <li key={String(issue.id)}>
                        <img
                            src={issue.user.avatar_url}
                            alt={issue.user.login}
                        />
                        <div>
                            <strong>
                                <a href={issue.html_url}>{issue.title}</a>
                                {issue.labels.map(label => (
                                    <span key={String(label.id)}>
                                        {label.name}
                                    </span>
                                ))}
                            </strong>
                            <p>{issue.user.login}</p>
                        </div>
                    </li>
                ))}
            </IssuesList>
        </Container>
    );
}

Repository.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            repository: PropTypes.string,
        }),
    }).isRequired,
};

export default Repository;
