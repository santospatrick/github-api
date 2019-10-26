import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import parse from 'parse-link-header';
import { Loading, Owner, IssuesList, Select, PageActions } from './styles';
import api from '../../services/api';
import Container from '../../components/Container';

function Repository({ match }) {
    const repoName = decodeURIComponent(match.params.repository);

    const [repository, setRepository] = useState({});
    const [loading, setLoading] = useState(true);
    const [issues, setIssues] = useState([]);
    const [filter, setFilter] = useState('open');
    const [page, setPage] = useState(1);
    const [disableNextPage, setDisableNextPage] = useState(true);

    useEffect(() => {
        async function getInfo() {
            const [info, openIssues] = await Promise.all([
                api.get(`/repos/${repoName}`),
                api.get(`/repos/${repoName}/issues`, {
                    params: {
                        state: filter,
                        per_page: 5,
                        page,
                    },
                }),
            ]);

            if (openIssues.headers.link) {
                const parsedLink = parse(openIssues.headers.link);
                setDisableNextPage(!parsedLink.last);
            } else {
                setDisableNextPage(true);
            }

            setRepository(info.data);
            setIssues(openIssues.data);
            setLoading(false);
        }

        getInfo();
    }, [repoName]);

    async function handleSelectChange(event) {
        setFilter(event.target.value);
        setIssues([]);
        setPage(1);

        const response = await api.get(`/repos/${repoName}/issues`, {
            params: {
                state: event.target.value,
                per_page: 5,
                page: 1,
            },
        });

        if (response.headers.link) {
            const parsedLink = parse(response.headers.link);
            setDisableNextPage(!parsedLink.last);
        } else {
            setDisableNextPage(true);
        }

        setIssues(response.data);
    }

    async function handlePage(action) {
        const nextPage = action === 'back' ? page - 1 : page + 1;
        setPage(nextPage);

        const response = await api.get(`/repos/${repoName}/issues`, {
            params: {
                state: filter,
                per_page: 5,
                page: nextPage,
            },
        });

        if (response.headers.link) {
            const parsedLink = parse(response.headers.link);
            setDisableNextPage(!parsedLink.last);
        } else {
            setDisableNextPage(true);
        }

        setIssues(response.data);
    }

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
                <Select onChange={handleSelectChange} value={filter}>
                    <option value="open">Abertas</option>
                    <option value="closed">Fechadas</option>
                    <option value="all">Todas</option>
                </Select>

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
            <PageActions>
                <button
                    type="button"
                    disabled={page < 2}
                    onClick={() => handlePage('back')}
                >
                    Anterior
                </button>
                <span>Página {page}</span>
                <button
                    type="button"
                    disabled={disableNextPage}
                    onClick={() => handlePage('next')}
                >
                    Próximo
                </button>
            </PageActions>
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
